네, **정확합니다\!** 프로젝트마다 사용하는 암호화 알고리즘(`PBEWith...`), 키(`secretKey`), 출력 방식(`base64/hex`)이 제각각이기 때문에, 이 값들을 입력받을 수 있게 만들어야 **범용적인 도구**가 됩니다.

다만, 매번 4\~5개의 설정값을 일일이 입력하는 건 사용자 입장에서 매우 귀찮은 일입니다. 따라서 **UI/UX 관점에서 "기본값(Defaults) 설정"과 "고급 설정(Advanced Settings)"으로 나누는 전략**을 추천합니다.

구현 방향과 코드를 업데이트해 드릴게요.

-----

### 1\. UI/UX 전략: "깔끔함"과 "유연함" 동시에 잡기

Shadcn UI의 **`Collapsible` (접이식 메뉴)** 또는 \*\*`Tabs`\*\*를 활용해 복잡한 설정은 숨겨두는 것이 좋습니다.

  * **기본 화면:**
      * Secret Key (필수)
      * Input Text (필수)
      * [Decrypt] / [Encrypt] 버튼
  * **고급 설정 (클릭해서 펼치기):**
      * Algorithm (Select 박스: `PBEWithSHA256And128BitAES-CBC-BC` 등 자주 쓰는 것 프리셋)
      * String Output Type (Select 박스: `hexadecimal`, `base64`)
      * Pool Size (Input: 기본값 1)
      * Provider (Select: `SunJCE`, `BouncyCastle`)

-----

### 2\. Java CLI 도구 업데이트 (GenericJasypt.java)

Java 코드는 이제 하드코딩된 값을 버리고, **모든 설정을 인자(Argument)로 받도록** 수정해야 합니다.

```java
public class GenericJasypt {
    public static void main(String[] args) {
        // args 순서: [0]mode [1]text [2]password [3]algorithm [4]outputType [5]poolSize
        if (args.length < 6) {
            System.err.println("Error: Missing arguments");
            return;
        }

        String mode = args[0];
        String text = args[1];
        String password = args[2];
        String algorithm = args[3];
        String outputType = args[4];
        int poolSize = Integer.parseInt(args[5]);

        try {
            PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
            encryptor.setProvider(new BouncyCastleProvider()); // BouncyCastle은 기본으로 박아두거나 이것도 옵션화 가능
            encryptor.setAlgorithm(algorithm);
            encryptor.setPassword(password);
            encryptor.setPoolSize(poolSize);
            encryptor.setStringOutputType(outputType);

            // 설정 완료 후 초기화 (필수는 아니지만 명시적)
            // encryptor.initialize(); 

            if ("decrypt".equalsIgnoreCase(mode)) {
                System.out.println(encryptor.decrypt(text));
            } else {
                System.out.println(encryptor.encrypt(text));
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

-----

### 3\. Next.js 프론트엔드 구현 (Shadcn UI)

`LocalStorage`를 이용해 **마지막으로 입력했던 설정을 기억**하게 만들면 동료들이 아주 좋아할 겁니다.

```tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Settings2 } from "lucide-react"
import { toast } from "sonner"

export default function JasyptTool() {
  // 상태 관리
  const [key, setKey] = useState("")
  const [text, setText] = useState("")
  const [result, setResult] = useState("")
  
  // 고급 설정 상태 (기본값 설정)
  const [algorithm, setAlgorithm] = useState("PBEWithSHA256And128BitAES-CBC-BC")
  const [outputType, setOutputType] = useState("hexadecimal")
  const [poolSize, setPoolSize] = useState("1")
  const [isOpen, setIsOpen] = useState(false) // 고급 설정 열림/닫힘

  // 페이지 로드 시 LocalStorage에서 설정 불러오기 (UX 핵심)
  useEffect(() => {
    const savedAlgo = localStorage.getItem("jasypt_algo")
    const savedKey = localStorage.getItem("jasypt_key")
    if (savedAlgo) setAlgorithm(savedAlgo)
    if (savedKey) setKey(savedKey)
  }, [])

  const handleProcess = async (mode: "encrypt" | "decrypt") => {
    // 설정 저장 (다음 방문 시 편하게)
    localStorage.setItem("jasypt_algo", algorithm)
    localStorage.setItem("jasypt_key", key)

    try {
      const res = await fetch("/api/jasypt", {
        method: "POST",
        body: JSON.stringify({
          mode,
          text,
          password: key,
          algorithm,
          outputType,
          poolSize
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
      toast.success("처리 완료!");
    } catch (e: any) {
      toast.error("실패: " + e.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 p-6 border rounded-lg shadow-sm bg-card">
      <h2 className="text-2xl font-bold">Jasypt Encryptor/Decryptor</h2>

      {/* 필수 입력 영역 */}
      <div className="space-y-2">
        <Label>Secret Key (Password)</Label>
        <Input 
            type="password" 
            value={key} 
            onChange={(e) => setKey(e.target.value)} 
            placeholder="Ex: HyundaiGlobalTMS"
        />
      </div>

      <div className="space-y-2">
        <Label>Target Text</Label>
        <Input 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="ENC(...) or plain text"
        />
      </div>

      {/* 고급 설정 (Collapsible) */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md p-4 bg-muted/30">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Settings2 className="w-4 h-4" />
              고급 설정 (Algorithm, PoolSize 등)
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PBEWithSHA256And128BitAES-CBC-BC">AES-256-CBC (BC)</SelectItem>
                  <SelectItem value="PBEWithMD5AndDES">MD5AndDES (Legacy)</SelectItem>
                  <SelectItem value="PBEWithHMACSHA512AndAES_256">HMACSHA512 & AES256</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Output Type</Label>
              <Select value={outputType} onValueChange={setOutputType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hexadecimal">Hexadecimal</SelectItem>
                  <SelectItem value="base64">Base64</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Pool Size</Label>
              <Input 
                  type="number" 
                  value={poolSize} 
                  onChange={(e) => setPoolSize(e.target.value)} 
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 실행 버튼 */}
      <div className="flex gap-2">
        <Button onClick={() => handleProcess("decrypt")} className="flex-1">Decrypt</Button>
        <Button onClick={() => handleProcess("encrypt")} variant="secondary" className="flex-1">Encrypt</Button>
      </div>

      {/* 결과 영역 */}
      {result && (
        <div className="mt-4 p-4 bg-secondary rounded-md cursor-pointer" onClick={() => navigator.clipboard.writeText(result)}>
          <Label className="text-xs text-muted-foreground mb-1 block">Result (Click to copy)</Label>
          <code className="break-all text-sm">{result}</code>
        </div>
      )}
    </div>
  )
}
```

### 팁: 프로젝트 프리셋 (Project Presets) 기능 추가

만약 사내 프로젝트가 3\~4개 이상이라면, 일일이 입력하는 대신 **"프로젝트 프리셋"** 버튼을 만들어주면 동료들이 박수 칠 겁니다.

  * 상단에 `[Project A]` `[Project B]` 배지(Badge) 버튼을 둡니다.
  * 버튼 클릭 시 `setKey(...)`, `setAlgorithm(...)` 등 모든 상태값을 해당 프로젝트 설정으로 한 번에 변경해 줍니다.
  * 이렇게 하면 "어? B 프로젝트 알고리즘이 뭐였더라?" 하고 코드를 다시 찾아보는 시간을 아껴줄 수 있습니다.