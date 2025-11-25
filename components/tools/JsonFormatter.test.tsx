/**
 * JsonFormatter 컴포넌트 테스트
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JsonFormatter } from './JsonFormatter'

// 테스트용 유틸리티
const mockToast = jest.fn()

jest.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => {
    return inputs
      .flat()
      .filter((x) => typeof x === "string" && x.length > 0)
      .join(" ")
  },
  copyToClipboard: jest.fn(async () => {
    mockToast()
    return true
  }),
}))

describe('JsonFormatter Component', () => {
  beforeEach(() => {
    mockToast.mockClear()
  })

  describe('Rendering', () => {
    it('should render component with initial state', () => {
      render(<JsonFormatter />)

      expect(screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)).toBeInTheDocument()
      expect(screen.getByText('포맷팅')).toBeInTheDocument()
      expect(screen.getByText('축소')).toBeInTheDocument()
      expect(screen.getByText('초기화')).toBeInTheDocument()
    })

    it('should display input label', () => {
      render(<JsonFormatter />)

      expect(screen.getByText(/입력 \(Input\)/i)).toBeInTheDocument()
    })

    it('should display help tip', () => {
      render(<JsonFormatter />)

      expect(screen.getByText(/💡 팁:/i)).toBeInTheDocument()
    })

    it('should have mode toggle buttons', () => {
      render(<JsonFormatter />)

      const formatBtn = screen.getAllByText('포맷팅')[0]
      const minifyBtn = screen.getByText('축소')

      expect(formatBtn).toBeInTheDocument()
      expect(minifyBtn).toBeInTheDocument()
    })
  })

  describe('Input and Validation', () => {
    it('should update input when user types', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const validJson = '{"name":"test"}'

      await user.type(textarea, validJson)

      expect(textarea).toHaveValue(validJson)
    })

    it('should show valid status for valid JSON', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      await user.type(textarea, '{"test":true}')

      await waitFor(() => {
        expect(screen.getByText('✓ Valid')).toBeInTheDocument()
      })
    })

    it('should show "대기중" status initially', () => {
      render(<JsonFormatter />)

      expect(screen.getByText('대기중')).toBeInTheDocument()
    })

    it('should show error for invalid JSON', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      await user.type(textarea, '{invalid}')

      await waitFor(() => {
        expect(screen.getByText(/JSON 오류/i)).toBeInTheDocument()
      })
    })

    it('should clear error when valid JSON is entered', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)

      // Enter invalid JSON
      await user.type(textarea, '{invalid}')

      await waitFor(() => {
        expect(screen.getByText(/JSON 오류/i)).toBeInTheDocument()
      })

      // Clear and enter valid JSON
      await user.clear(textarea)
      await user.type(textarea, '{"valid":true}')

      await waitFor(() => {
        expect(screen.queryByText(/JSON 오류/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Format Button', () => {
    it('should format JSON when format button is clicked', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1] // The action button, not the mode button

      await user.type(textarea, '{"name":"John","age":30}')
      await user.click(formatBtn)

      await waitFor(() => {
        expect(screen.getByText(/결과 \(Output\)/i)).toBeInTheDocument()
        expect(screen.getByText('유효한 JSON')).toBeInTheDocument()
      })
    })

    it('should display formatted output with indentation', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, '{"a":1,"b":2}')
      await user.click(formatBtn)

      await waitFor(() => {
        const output = screen.getByText(/결과 \(Output\)/i).parentElement?.querySelector('pre')
        expect(output).toHaveTextContent('"a"')
        expect(output?.textContent).toContain('\n') // Has indentation
      })
    })

    it('should show error when formatting invalid JSON', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, '{invalid}')
      await user.click(formatBtn)

      await waitFor(() => {
        expect(screen.getByText(/JSON 오류/i)).toBeInTheDocument()
      })
    })
  })

  describe('Minify Button', () => {
    it('should switch to minify mode when minify button is clicked', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const minifyModeBtn = screen.getByText('축소')
      await user.click(minifyModeBtn)

      // The action button should now show minify
      const minifyActionBtn = screen.getByText('축소')
      expect(minifyActionBtn).toBeInTheDocument()
    })

    it('should minify JSON when minify is executed', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)

      // Input formatted JSON
      const formattedJson = `{
  "name": "John",
  "age": 30
}`
      await user.type(textarea, formattedJson)

      // Switch to minify mode
      const minifyModeBtn = screen.getByText('축소')
      await user.click(minifyModeBtn)

      // Click minify button
      const minifyActionBtns = screen.getAllByText('축소')
      const minifyActionBtn = minifyActionBtns[minifyActionBtns.length - 1]
      await user.click(minifyActionBtn)

      await waitFor(() => {
        const output = screen.getByText(/결과 \(Output\)/i).parentElement?.querySelector('pre')
        expect(output?.textContent).not.toContain('\n')
        expect(output?.textContent).toContain('"name":"John"')
      })
    })
  })

  describe('Copy Button', () => {
    it('should display copy button when result is available', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, '{"test":true}')
      await user.click(formatBtn)

      await waitFor(() => {
        expect(screen.getByText(/복사/i)).toBeInTheDocument()
      })
    })

    it('should copy result to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, '{"test":true}')
      await user.click(formatBtn)

      await waitFor(() => {
        expect(screen.getByText(/복사/i)).toBeInTheDocument()
      })

      const copyBtn = screen.getByText(/복사/i)
      await user.click(copyBtn)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled()
      })
    })

    it('should not display copy button initially', () => {
      render(<JsonFormatter />)

      const copyBtns = screen.queryAllByText(/복사/i)
      expect(copyBtns.length).toBe(0)
    })
  })

  describe('Reset Button', () => {
    it('should clear all content when reset button is clicked', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, '{"test":true}')
      await user.click(formatBtn)

      await waitFor(() => {
        expect(screen.getByText(/결과 \(Output\)/i)).toBeInTheDocument()
      })

      const resetBtn = screen.getByText(/초기화/i)
      await user.click(resetBtn)

      expect(textarea).toHaveValue('')
      expect(screen.queryByText(/결과 \(Output\)/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/JSON 오류/i)).not.toBeInTheDocument()
    })

    it('should reset status to "대기중" after reset', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      await user.type(textarea, '{"test":true}')

      await waitFor(() => {
        expect(screen.getByText('✓ Valid')).toBeInTheDocument()
      })

      const resetBtn = screen.getByText(/초기화/i)
      await user.click(resetBtn)

      expect(screen.getByText('대기중')).toBeInTheDocument()
    })
  })

  describe('Mode Switching', () => {
    it('should clear result when switching modes', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, '{"test":true}')
      await user.click(formatBtn)

      await waitFor(() => {
        expect(screen.getByText(/결과 \(Output\)/i)).toBeInTheDocument()
      })

      const minifyModeBtn = screen.getByText('축소')
      await user.click(minifyModeBtn)

      expect(screen.queryByText(/결과 \(Output\)/i)).not.toBeInTheDocument()
    })
  })

  describe('Complex JSON', () => {
    it('should handle nested objects', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const complexJson = '{"user":{"name":"John","address":{"city":"Seoul"}}}'
      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, complexJson)
      await user.click(formatBtn)

      await waitFor(() => {
        const output = screen.getByText(/결과 \(Output\)/i).parentElement?.querySelector('pre')
        expect(output?.textContent).toContain('Seoul')
      })
    })

    it('should handle arrays', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const jsonWithArray = '[1,2,3,{"key":"value"}]'
      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, jsonWithArray)
      await user.click(formatBtn)

      await waitFor(() => {
        const output = screen.getByText(/결과 \(Output\)/i).parentElement?.querySelector('pre')
        expect(output?.textContent).toContain('key')
      })
    })

    it('should handle special characters', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const jsonWithSpecialChars = '{"text":"Hello\\nWorld","path":"C:\\\\Users"}'
      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, jsonWithSpecialChars)
      await user.click(formatBtn)

      await waitFor(() => {
        expect(screen.getByText(/유효한 JSON/i)).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string input', async () => {
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      expect(textarea).toHaveValue('')
      expect(screen.getByText('대기중')).toBeInTheDocument()
    })

    it('should handle whitespace-only input', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      await user.type(textarea, '   \n  ')

      await waitFor(() => {
        expect(screen.getByText('대기중')).toBeInTheDocument()
      })
    })

    it('should handle very long JSON', async () => {
      const user = userEvent.setup()
      render(<JsonFormatter />)

      const longJson = JSON.stringify(
        Array.from({ length: 100 }, (_, i) => ({ id: i, value: `item${i}` }))
      )
      const textarea = screen.getByPlaceholderText(/JSON을 여기에 입력하세요/i)
      const formatBtn = screen.getAllByText('포맷팅')[1]

      await user.type(textarea, longJson)
      await user.click(formatBtn)

      await waitFor(() => {
        expect(screen.getByText(/결과 \(Output\)/i)).toBeInTheDocument()
      })
    })
  })
})
