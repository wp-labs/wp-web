# WPL
WPL (Warp Parse Language) 是为工业级数据治理设计的强类型领域特定语言（DSL），它通过内置的逻辑感知算子、复合协议原生支持及双层处理流水线，能比传统正则表达式更精准、高效地将非结构化文本转化为高质量的结构化信息

## 更简洁

示例： 解析AWS日志
### WPL:
size 1132
```bash
   rule aws {
        (
            symbol(http),
            chars:timestamp,
            chars:elb,
            chars:client_host,
            chars:target_host,
            chars:request_processing_time,
            chars:target_processing_time,
            chars:response_processing_time,
            chars:elb_status_code,
            chars:target_status_code,
            chars:received_bytes,
            chars:sent_bytes,
            chars:request | (chars:request_method, chars:request_url, chars:request_protocol),
            chars:user_agent,
            chars:ssl_cipher,
            chars:ssl_protocol,
            chars:target_group_arn,
            chars:trace_id,
            chars:domain_name,
            chars:chosen_cert_arn,
            chars:matched_rule_priority,
            chars:request_creation_time,
            chars:actions_executed,
            chars:redirect_url,
            chars:error_reason,
            chars:target_port_list,
            chars:target_status_code_list,
            chars:classification,
            chars:classification_reason,
            chars:traceability_id,
        )
   }
```

### VRL(Vector)
size : 2285
```
source = '''
  parsed = parse_regex!(.message, r'^(?P<type>\S+) (?P<timestamp>\S+) (?P<elb>\S+) (?P<client_host>\S+) (?P<target_host>\S+) (?P<request_processing_time>[-\d\.]+) (?P<target_processing_time>[-\d\.]+) (?P<response_processing_time>[-\d\.]+) (?P<elb_status_code>\S+) (?P<target_status_code>\S+) (?P<received_bytes>\d+) (?P<sent_bytes>\d+) "(?P<request_method>\S+) (?P<request_url>[^ ]+) (?P<request_protocol>[^"]+)" "(?P<user_agent>[^"]*)" "(?P<ssl_cipher>[^"]*)" "(?P<ssl_protocol>[^"]*)" (?P<target_group_arn>\S+) "(?P<trace_id>[^"]*)" "(?P<domain_name>[^"]*)" "(?P<chosen_cert_arn>[^"]*)" (?P<matched_rule_priority>\S+) (?P<request_creation_time>\S+) "(?P<actions_executed>[^"]*)" "(?P<redirect_url>[^"]*)" "(?P<error_reason>[^"]*)" "(?P<target_port_list>[^"]*)" "(?P<target_status_code_list>[^"]*)" "(?P<classification>[^"]*)" "(?P<classification_reason>[^"]*)" (?P<traceability_id>\S+)$')
  .timestamp = parsed.timestamp
  .symbol = parsed.type
  .elb = parsed.elb
  .client_host = parsed.client_host
  .target_host = parsed.target_host
  .request_processing_time = parsed.request_processing_time
  .target_processing_time = parsed.target_processing_time
  .response_processing_time = parsed.response_processing_time
  .elb_status_code = parsed.elb_status_code
  .target_status_code = parsed.target_status_code
  .received_bytes = parsed.received_bytes
  .sent_bytes = parsed.sent_bytes
  .request_method = parsed.request_method
  .request_url = parsed.request_url
  .request_protocol = parsed.request_protocol
  .user_agent = parsed.user_agent
  .ssl_cipher = parsed.ssl_cipher
  .ssl_protocol = parsed.ssl_protocol
  .target_group_arn = parsed.target_group_arn
  .trace_id = parsed.trace_id
  .domain_name = parsed.domain_name
  .chosen_cert_arn = parsed.chosen_cert_arn
  .matched_rule_priority = parsed.matched_rule_priority
  .request_creation_time = parsed.request_creation_time
  .actions_executed = parsed.actions_executed
  .redirect_url = parsed.redirect_url
  .error_reason = parsed.error_reason
  .target_port_list = parsed.target_port_list
  .target_status_code_list = parsed.target_status_code_list
  .classification = parsed.classification
  .classification_reason = parsed.classification_reason
  .traceability_id = parsed.traceability_id
  del(.message)
'''
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
