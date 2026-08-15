# Community Role Presentation Result Usage Audit

`CommunityRoleQuickActionUseCase.execute()` returns frozen
`{ added, action, roleName }`.

| Result field | Current role presentation use | Future presentation input |
| --- | --- | --- |
| `added` | Controls the join/unlock wording in all three branches | required |
| `action` | Not rendered; runtime already selects the branch | not required as workflow result data |
| `roleName` | Not read; current renderer owns its Games/Invest/Dev display names | not required |

The mutation Gateway deliberately catches `member.roles.add()` rejection and
returns `true` after hierarchy/role checks pass. That existing observable
`added` value is represented exactly by the presentation candidate; this slice
does not correct or reinterpret it.

The future builder input is therefore semantic and narrow:
`{ action, added, links }`. It does not receive an Interaction, Guild, Member,
Gateway, UseCase result object, or raw role object.
