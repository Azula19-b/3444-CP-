# Optional Git history remediation

This repository's current tree no longer tracks local account data. An earlier public commit remains reachable through historical branches and contains one contributor-linked account record with a bcrypt password hash. Credential notification and rotation take priority because rewriting Git history cannot remove copies already present in clones or forks.

History remediation is optional and must not begin without explicit repository-owner approval and coordination with every collaborator. It is separate from the repository quality improvements.

## Coordinated procedure

1. Confirm privately that the affected contributor has assessed password reuse and rotated any reused or uncertain credentials.
2. Freeze repository pushes and identify every affected branch, tag, pull-request reference, fork, and collaborator clone.
3. Preserve a restricted backup for recovery and perform the cleanup in a fresh mirror clone.
4. Use a current `git-filter-repo` release with sensitive-data removal to remove only `server/data/users.json` from all affected refs.
5. Verify that the account file is absent from all rewritten refs and that legitimate source changes, commit messages, author fields, and contributor attribution remain. Commit hashes will necessarily change.
6. Run the complete frontend and backend checks against the rewritten default and professionalization branches.
7. With explicit approval, force-update the coordinated branches and tags. Do not overwrite work created during the cleanup window.
8. Ask collaborators to re-clone or carefully clean and rebase their branches; merging an old clone can reintroduce the removed history.
9. Coordinate with fork owners and contact GitHub Support about cached views, pull-request references, and server-side garbage collection.
10. Restore branch protections, re-enable normal contributions, and verify that the sensitive path is no longer reachable from GitHub refs.

This process preserves the substance and authorship of legitimate project work, but it cannot preserve commit identifiers or signatures. It also cannot erase independent copies that have already been cloned. Follow GitHub's official [sensitive-data removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) before execution.
