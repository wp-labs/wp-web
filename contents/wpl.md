# WPL
WPL (Warp Parse Language) 是为工业级数据治理设计的强类型领域特定语言（DSL），它通过内置的逻辑感知算子、复合协议原生支持及双层处理流水线，能比传统正则表达式更精准、高效地将非结构化文本转化为高质量的结构化信息

## 更简洁

示例： 解析AWS日志
### WPL:
size 287
```bash
rule nginx {
    (
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
    )
}
```

### VRL(Vector)
size : 910
```
m = parse_regex!(
  string!(.message),
  r'^date:(?P<date>[0-9]+(?:\.[0-9]+)?)\s+log:(?P<sip>\S+)\s+\S+\s+\S+\s+\[(?P<dt>\d{2}\/[A-Za-z]{3}\/\d{4}:\d{2}:\d{2}:\d{2})\s+[+\-]\d{4}\]\s+\\"(?P<req>[^\\"]*)\\"\s+(?P<status>\d{3})\s+(?P<size>\d+)\s+\\"(?P<referer>[^\\"]*)\\"\s+\\"(?P<agent>[^\\"]*)\\"\s+\\"[^\\"]*\\"$'
)

.date = to_float!(m.date)
.sip = m.sip

t = parse_timestamp!(m.dt, format: "%d/%b/%Y:%H:%M:%S", timezone: "Asia/Shanghai")
.recv_time = format_timestamp!(t, format: "%F %T")

."http/request" = m.req
."http/status" = to_int!(m.status)
.digit = to_int!(m.size)
.chars = m.referer

ua = replace(m.agent, ";", "")
ua = replace(ua, "Mozilla/5.0 (", "Mozilla/5.0(")
."http/agent" = ua + " "

. = {
  "date": .date,
  "sip": .sip,
  "recv_time": .recv_time,
  "http/request": ."http/request",
  "http/status": ."http/status",
  "digit": .digit,
  "chars": .chars,
  "http/agent": ."http/agent",
  }
```

### Logstash

size :1071
```conf
input {
  file {
    path => ["in_data/medium_aws_411B"]
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }
}

filter {
  dissect {
    mapping => {
      "message" => '%{symbol} %{timestamp} %{elb} %{client_host} %{target_host} %{request_processing_time} %{target_processing_time} %{response_processing_time} %{elb_status_code} %{target_status_code} %{received_bytes} %{sent_bytes} "%{raw_request}" "%{user_agent}" "%{ssl_cipher}" "%{ssl_protocol}" %{target_group_arn} "%{trace_id}" "%{domain_name}" "%{chosen_cert_arn}" %{matched_rule_priority} %{request_creation_time} "%{actions_executed}" "%{redirect_url}" "%{error_reason}" "%{target_port_list}" "%{target_status_code_list}" "%{classification}" "%{classification_reason}" %{traceability_id}'
    }
  }

  dissect {
    mapping => {
      "raw_request" => "%{request_method} %{request_url} %{request_protocol}"
    }
  }

  mutate {
  remove_field => ["message","@timestamp","@version","event","[event][original]","raw_request"]
}
}

output {
  file { path => "/dev/null" codec => "json_lines" }
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
