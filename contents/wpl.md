# WPL
WPL (Warp Parse Language) 是为工业级数据治理设计的强类型领域特定语言（DSL），它通过内置的逻辑感知算子、复合协议原生支持及双层处理流水线，能比传统正则表达式更精准、高效地将非结构化文本转化为高质量的结构化信息

## 更简洁

示例： 解析Nginx日志
### WPL:
```bash
   rule nginx {
        (ip:sip,_^2,chars:timestamp<[,]>,http/request:http_request",chars:status,chars:size,chars:referer",http/agent:http_agent",_")
   }
```

### VRL(Vector)
```
source = '''
  parsed = parse_regex!(.message, r'^(?P<client>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<request>[^"]*)" (?P<status>\d{3}) (?P<size>\d+) "(?P<referer>[^"]*)" "(?P<agent>[^"]*)" "(?P<extra>[^"]*)"')
  .sip = parsed.client
  .http_request = parsed.request
  .status = parsed.status
  .size = parsed.size
  .referer = parsed.referer
  .http_agent = parsed.agent
  .timestamp = parsed.time
  del(.message)
'''
```
## 更强控制
内置元信息（Meta-info）提供了远超正则的容错能力：
* alt (择一容错)： 处理“同位不同类型”的情况（例如同一位置有时是 IP，有时是数字）。
* opt (可选匹配)： 单条规则适配字段存在或缺失的多种变体，无需编写复杂的非捕获组。
* some_of (循环探测)： 自动扫描并提取零散、重复的片段（如中文告警正文中的多个 KV 对），极大地简化了扫描逻辑


## 集成化流水线（Pipeline）
WPL 将“清洗”与“解析”整合在一个表达式中，避免了数据在多个组件间传递的开销：
• 预处理管道： 支持在解析前进行 |decode/base64|unquote/unescape|decode/hex| 等顺序转换，确保后续解析器始终在标准化的文本上工作。

```
package /pipe_demo {
    rule fmt_from_base64 {
        // Input like: base64("{ \"a\": 2, \"b\": \"bar\" }")
        // 1) base64 decode
        // 2) strip outer quotes and unescape inner quotes
        // 3) parse JSON into fields
        |decode/base64|unquote/unescape|(json)
    }
}
```
