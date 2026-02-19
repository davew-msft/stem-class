<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.0.1
- Modified principles: Test-First → Test-First and Unit Tests (relaxed for rapid prototype)
- Rationale: High school STEM class context - focus on learning over testing overhead
- Templates requiring updates: ✅ plan-template.md (updated constitution check)
- Follow-up TODOs: None
-->

# Rescan Constitution

## Core Principles

### I. Educational-First
Every feature must serve clear educational objectives for STEM learners. Code must be self-documenting with extensive comments explaining technical concepts. Examples and tutorials are mandatory for all components. Learning progression must be considered: basic concepts before advanced features.

**Rationale**: This project exists to teach STEM concepts; educational value takes precedence over optimization.

### II. Specification-Driven Development
All features begin with a specification following the Speckit framework. User scenarios must be testable and prioritized. Requirements must be validated before implementation begins. Planning documents are living artifacts that evolve with the project.

**Rationale**: Systematic specification ensures educational objectives are met and prevents scope creep.

### III. Test-First and Unit Tests
This is a rapid prototype project for a high school STEM class.  We do NOT need TDD, unit tests, or integration tests **at this time**.  

### IV. Observability
All operations must produce clear, readable logs. Error messages must be educational and actionable. Progress indicators required for long-running operations. Debug output should help students understand program flow.

**Rationale**: Transparency in execution helps students learn troubleshooting and debugging skills.

### V. Simplicity
Default to the simplest solution that meets educational objectives. Avoid premature optimization. Complex patterns require explicit justification in terms of learning value. Code readability trumps performance unless performance is the lesson.

**Rationale**: Complex code obscures learning; students should focus on concepts, not implementation complexity.

## Educational Standards

All code must meet educational accessibility standards. Documentation must include learning objectives and prerequisite knowledge. Code examples must progress from simple to complex. Interactive elements should support different learning styles. Assessment criteria must be clearly defined.

## Development Workflow

Features follow the Speckit agent workflow: specification → planning → task breakdown → implementation → testing. All phases must include peer review for educational appropriateness. Student feedback integration is mandatory. Regular assessment of learning outcomes drives iteration.

## Governance

This constitution supersedes all other development practices. Amendments require documentation of educational impact and approval from instructional team. All development decisions must verify compliance with educational objectives. Complexity must be justified in terms of learning value rather than technical elegance.

**Version**: 1.0.1 | **Ratified**: 2026-02-19 | **Last Amended**: 2026-02-19
