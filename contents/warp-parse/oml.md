# OML

声明式语法，能将零散的数据字段自动重组为复杂的结构化业务模型，并支持通过 SQL 查询实时“借调”外部信息来增强数据内容

## 示例
### OML
```bash
size : digit = take(size);
status : digit = take(status);
match_chars = match read(option:[wp_src_ip]) {
    ip(127.0.0.1) => chars(localhost); 
    !ip(127.0.0.1) => chars(attack_ip); 
};
str_status = match read(option:[status]) {
    digit(500) => chars(Internal Server Error);
    digit(404) => chars(Not Found); 
};
* : auto = read();
```

### VRL
```toml
.status = to_int!(parsed.status)
.size = to_int!(parsed.size)
if .host == "127.0.0.1" {
    .match_chars = "localhost"
} else if .host != "127.0.0.1" {
    .match_chars = "attack_ip"
}  
if .status == 500 {
    .str_status = "Internal Server Error"
} else if .status == 404 {
    .str_status = "Not Found"
}  
'''
```


## 核心设计理念：声明式建模
* 描述性语法：OML 采用声明式语法，其核心理念是“描述要什么，而不是如何做”。用户只需定义最终输出的数据结构，而无需编写底层的处理逻辑，这使得在处理 Web 日志或系统监控数据时非常高效且清晰。
* 对象化思维：它不仅是聚合工具，更是一种建模语言，能将零散的字段组装成复杂的、具有业务意义的嵌套 JSON 对象。

## 精确的数据处理机制
* 语义明确的读取模式：
  * read（非破坏性读取）：支持字段复用，允许从源数据中多次克隆值。
  * take（破坏性读取）：实现“一次性消费”，读取后即从源数据中移除，有效防止逻辑重复使用和数据冗余。
* 强类型安全与自动推断：支持 ip、time、digit 等多种基本类型及 array、obj 复合类型。它提供自动类型推断 (auto)，确保了从原始字符串到结构化数据的准确转换。

## 强大的逻辑与聚合能力
* 链式管道处理 (pipe)：支持通过管道进行连续的数据转换操作，使处理流程像流水线一样清晰。
* 灵活的聚合构造：提供 map/object 进行对象聚合，以及 collect 进行数组聚合，能够轻松构建任意深度的嵌套结构。
* 模式匹配 (match)：支持基于条件的分支处理，类似于编程语言中的选择逻辑，可根据输入内容执行不同的聚合方案。

## 独特的高级增强特性
* 原生 SQL 集成：OML 可以在构建对象时直接查询数据库进行数据增强。例如，通过 SQL 实时获取用户详细信息或 IP 地理位置，极大地丰富了数据的上下文。
* 批量处理能力：利用通配符 (*) 进入批量模式，可以同时处理多个符合特定模式的目标字段
