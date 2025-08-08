# Implementation Planning Process

This document outlines the standard process for planning feature implementations in this project.

## Planning Process Steps

### 1. Understand the Requirements
- **For GitHub tickets**: Use `gh issue view [number]` to fetch ticket details
- **For ad-hoc requests**: Clarify requirements through discussion
- Read/identify requirements, features, benefits, and technical approach
- Identify any constraints or considerations

### 2. Research the Codebase
- Use TodoWrite tool to track planning progress
- Mark research as "in_progress"
- Examine existing file structure and architecture
- Understand how new features will integrate with current patterns
- Follow dependency injection patterns and testing constraints
- Mark research as "completed" when done

### 3. Create Comprehensive Plan Document
Create `plan.md` with the following sections (If one already exists, stop and ask what to do):

#### Required Sections:
- **Overview** - Brief description of what we're implementing
- **File Structure Changes** - New files and modified files
- **New Functions** - List functions with dependency injection pattern
- **Implementation Strategy** - Technical approach details
- **Code Modifications** - What changes to existing files
- **Testing Strategy** - How new code will be tested
- **Implementation Checklist** - Step-by-step tasks with checkboxes

#### Key Considerations:
- **Respect main.js constraint** - Cannot add code/functions to main.js (Jest compatibility)
- **Follow dependency injection** - All functions that use browser objects take `windowObj = window`, (or similar) parameter
- **Maintain testability** - All new functions must be testable with mock objects
- **Progressive enhancement** - New features should degrade gracefully
- **No dependencies** - Keep the project dependency-free except for Jest

### 4. Address Specific Questions
During planning, explicitly address:
- **File locations** - Where new files will live
- **Function signatures** - How functions will follow existing patterns
- **Testing approach** - How new code will be tested with mocks
- **Integration points** - How new code connects to existing code
- **Manual testing** - How to verify the feature works vs regular behavior
- **Version management** - Any versioning or cache invalidation concerns

### 5. Create Step-by-Step Checklist
Break implementation into phases with specific checkboxes:
- **Phase 1** - Core files/infrastructure
- **Phase 2** - JavaScript integration following patterns
- **Phase 3** - Testing and documentation
- **Phase 4** - Manual verification steps
- **Phase 5** - Quality assurance (make check, make test, regression testing)
- **Phase 6** - Dead code cleanup (for refactor projects only)

### 6. Dead Code Cleanup (Refactor Projects Only)
For projects that replace existing functionality, always include a dead code cleanup phase:

#### Identify Dead Code:
- **Functions** - Old functions replaced by new implementation
- **Exports** - Remove dead functions from `module.exports`
- **Tests** - Remove tests for deleted functions
- **Imports** - Remove dead imports from test files
- **References** - Search codebase for any remaining references

#### Verification Steps:
- All tests should still pass with same or fewer test count
- No linting or formatting errors
- No broken imports or undefined function references
- Functionality should work exactly the same as before cleanup

### 7. Document Future Maintenance
- Note any ongoing maintenance requirements
- Explain any new concepts that future developers need to understand.
