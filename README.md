# 全固态电池化学配平计算器 (Stoichiometry Calculator)

一款专为材料科学与电化学研究设计的在线工具，旨在简化全固态电池（ASSB）合成过程中的化学计量比计算。

🚀 **在线访问**: [https://sc-pliu.vercel.app](https://sc-pliu.vercel.app)

---
- **自动化学配平**: 输入反应物和产物，系统自动计算化学计量系数。
- **摩尔/质量转换**: 支持基于目标产物质量（克）自动推算反应物所需的精确称量质量。
- **元素守恒校验**: 实时检测反应前后的原子守恒，确保计算严谨性。
- **响应式设计**: 适配 PC 和移动端，方便在实验室操作间随时使用。

---

## 🛠️ 技术栈

本项目采用现代前端技术架构，确保高性能与易维护性：

- **框架**: React 18 (TypeScript)
- **构建工具**: Vite
- **部署平台**: Vercel (CI/CD 自动化部署)
- **数据监控**: Vercel Analytics (实时访客统计)

---

## 📂 项目结构

```text
├── src/
│   ├── components/      # 计算器核心逻辑组件
│   ├── App.tsx          # 应用主入口
│   └── main.tsx         # Vercel Analytics 埋点与渲染
├── public/              # 静态资源（图标等）
├── package.json         # 项目依赖与脚本配置
└── vite.config.ts       # 构建配置