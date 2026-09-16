# Project Scope

This repository is a website project. It is independent and unrelated to the Rango SW
robotics platform.

The global steering files (tech stack, project structure, product overview) describe a
different codebase — the Rango SW industrial robotics monorepo (C++ controller, C#/.NET
IDE Core, Theia/Electron IDE UI). None of that applies here.

For this workspace, ignore the global steering that references:

- The Rango CLI, `rango-sw` layout, or the `Controller/`, `IDE/Core/`, `IDE/UI/` subsystems.
- The polyglot build stacks (CMake/C++, .NET/C#, Theia package monorepo) and their commands.
- Robotics domains, the 3D Visualizer, or robot controller targets.

Use conventions appropriate to a web project instead. When global steering conflicts with
this file, this file takes precedence.
