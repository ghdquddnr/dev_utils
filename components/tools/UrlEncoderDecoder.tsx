"use client";

import React, { useState } from "react";
import { encodeUrl, decodeUrl, parseQueryString } from "@/lib/url-handler";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, ArrowRightLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function UrlEncoderDecoder() {
  const [activeTab, setActiveTab] = useState("encode");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedParams, setParsedParams] = useState<Record<string, string> | null>(null);
  const [spaceAsPlus, setSpaceAsPlus] = useState(false);

  const handleEncode = () => {
    const res = encodeUrl(input, { spaceAsPlus });
    if (res.success) {
      setResult(res.data.result);
      setError(null);
      setParsedParams(null);
    } else {
      setError(res.error);
      setResult(null);
    }
  };

  const handleDecode = () => {
    const res = decodeUrl(input);
    if (res.success) {
      setResult(res.data.result);
      setError(null);
      setParsedParams(null);
    } else {
      setError(res.error);
      setResult(null);
    }
  };

  const handleParse = () => {
    const res = parseQueryString(input);
    if (res.success) {
      setResult(res.data.result); // JSON string
      setParsedParams(res.data.parameters || {});
      setError(null);
    } else {
      setError(res.error);
      setResult(null);
      setParsedParams(null);
    }
  };

  const handleAction = () => {
    if (activeTab === "encode") handleEncode();
    else if (activeTab === "decode") handleDecode();
    else handleParse();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다");
  };

  const handleReset = () => {
    setInput("");
    setResult(null);
    setError(null);
    setParsedParams(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Tabs defaultValue="encode" onValueChange={(val) => {
          setActiveTab(val);
          setError(null);
          setResult(null);
          setParsedParams(null);
        }} className="w-full">
          <TabsList className="w-full flex">
            <TabsTrigger value="encode">URL Encode</TabsTrigger>
            <TabsTrigger value="decode">URL Decode</TabsTrigger>
            <TabsTrigger value="parse">Query Parser</TabsTrigger>
          </TabsList>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Input</Label>
                <TabsContent value="encode" className="mt-0">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="space-mode"
                      checked={spaceAsPlus}
                      onCheckedChange={setSpaceAsPlus}
                    />
                    <Label htmlFor="space-mode" className="text-sm text-muted-foreground">
                      공백을 +로 변환
                    </Label>
                  </div>
                </TabsContent>
              </div>

              <TabsContent value="encode" className="mt-0">
                <Textarea
                  placeholder="인코딩할 텍스트를 입력하세요..."
                  className="min-h-[300px] font-mono text-sm resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="decode" className="mt-0">
                <Textarea
                  placeholder="디코딩할 URL을 입력하세요..."
                  className="min-h-[300px] font-mono text-sm resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="parse" className="mt-0">
                <Textarea
                  placeholder="파싱할 URL 또는 쿼리 스트링을 입력하세요..."
                  className="min-h-[300px] font-mono text-sm resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </TabsContent>

              <div className="flex gap-2">
                <Button onClick={handleAction} className="flex-1">
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  {activeTab === "encode" ? "Encode" : activeTab === "decode" ? "Decode" : "Parse"}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Output</Label>
              
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <Card className="h-[300px] overflow-hidden flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
                    <CardTitle className="text-sm font-medium">
                      Result
                    </CardTitle>
                    {result && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto p-4">
                    <TabsContent value="parse" className="mt-0 h-full">
                      {parsedParams ? (
                        Object.keys(parsedParams).length > 0 ? (
                          <div className="rounded-md border">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr className="border-b">
                                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Key</th>
                                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(parsedParams).map(([key, value]) => (
                                  <tr key={key} className="border-b last:border-0">
                                    <td className="p-4 font-medium">{key}</td>
                                    <td className="p-4 font-mono text-muted-foreground break-all">{value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            파라미터가 없습니다
                          </div>
                        )
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          결과가 여기에 표시됩니다
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="encode" className="mt-0 h-full">
                      {result ? (
                        <pre className="whitespace-pre-wrap break-all font-mono text-sm">
                          {result}
                        </pre>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          결과가 여기에 표시됩니다
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="decode" className="mt-0 h-full">
                      {result ? (
                        <pre className="whitespace-pre-wrap break-all font-mono text-sm">
                          {result}
                        </pre>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          결과가 여기에 표시됩니다
                        </div>
                      )}
                    </TabsContent>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Tabs>

        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <h3 className="mb-2 font-semibold text-foreground">💡 팁</h3>
          <ul className="list-inside list-disc space-y-1">
            {activeTab === "encode" && (
              <>
                <li>기본적으로 공백은 <code>%20</code>으로 인코딩됩니다.</li>
                <li><code>application/x-www-form-urlencoded</code> 형식(공백을 <code>+</code>로)이 필요한 경우 옵션을 켜세요.</li>
              </>
            )}
            {activeTab === "decode" && (
              <>
                <li><code>%20</code>과 <code>+</code> 모두 공백으로 디코딩됩니다.</li>
                <li>UTF-8 인코딩된 한글도 정상적으로 복원됩니다.</li>
              </>
            )}
            {activeTab === "parse" && (
              <>
                <li>전체 URL을 입력하면 자동으로 쿼리 스트링 부분만 추출하여 파싱합니다.</li>
                <li>해시(<code>#</code>) 뒷부분은 무시됩니다.</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
