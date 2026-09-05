# WPL
WPL (Warp Parse Language) 是为工业级数据治理设计的强类型领域特定语言（DSL），它通过内置的逻辑感知算子、复合协议原生支持及双层处理流水线，能比传统正则表达式更精准、高效地将非结构化文本转化为高质量的结构化信息

## 更简洁

示例： FB/nginx (json 下的 nginx)

### 样本
```json
{"date":1767006286.778936,"log":"180.57.30.149 - - [21/Jan/2025:01:40:02 +0800] \"GET /nginx-logo.png HTTP/1.1\" 500 368 \"http://207.131.38.110/\" \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36\" \"-\""}
```
### WPL:
size 162 (去空格)
```bash
rule nginx { (
    json | take(log) | json_unescape() | (
        ip:sip,
        2*_,
        time:recv_time<[,]>,
        http/request",
        http/status,
        digit,
        chars",
        http/agent",
        _"
    )  
) }
```

### VRL(Vector)
size : 419
```
source = '''
obj = parse_json!(string!(.message))
. = object!(obj)

.|= parse_regex!(
  string!(.log),
  r'^(?P<sip>\S+)\s+\S+\s+\S+\s+\[(?P<recv_time>\d{2}\/[A-Za-z]{3}\/\d{4}:\d{2}:\d{2}:\d{2})\s+[+\-]\d{4}\]\s+"(?P<http_request>[^"]*)"\s+(?P<status>\d{3})\s+(?P<digit>\d+)\s+"(?P<chars>[^"]*)"\s+"(?P<http_agent>[^"]*)"\s+"[^"]*"\s*$'
)
  .status = to_int!(.status)
  .digit = to_int!(.digit)
del(.log)
del(.message)
'''
```

### Logstash

size : 470
```conf
filter {
  json {
    source => "message"
  }
  dissect {
    mapping => {
      "log" => '%{sip} - - [%{recv_time} %{+recv_time}] "%{http_request}" %{status} %{digit} "%{chars}" "%{http_agent}" "%{ignore_tail}"'
    }
    tag_on_failure => ["nginx_dissect_failure"]
  }
  mutate {
    convert => {
      "status" => "integer"
      "digit"  => "integer"
    }
  }
  mutate {
    remove_field => ["log", "message", "ignore_tail","@timestamp","@version","event"]
  }
}
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
