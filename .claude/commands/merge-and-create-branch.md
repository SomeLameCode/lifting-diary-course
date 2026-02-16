You are performing a Git workflow automation.

Follow these steps strictly and abort with a clear explanation if any step fails.

1. Ensure the current branch is NOT $1.
   - If it is $1$, abort.

2. If there are uncommitted changes:
   - Stage all changes.
   - Analyze the diff.
   - Generate a Conventional Commit message using the format:
     <type>: <short summary>
   - Choose the most appropriate type (feat, fix, refactor, docs, chore, test).
   - Create a single commit.

3. Push the current branch to origin.

4. Switch to the $1 branch.

5. Pull the latest changes from origin/master.

6. Merge the previous branch into $1.

   If merge conflicts occur:

   - List all conflicted files.
   - For each conflicted file:
     - Summarize the changes made in $1.
     - Summarize the changes made in the merging branch.
     - Explain the root cause of the conflict.
     - Propose a clear and technically sound resolution.
     - Show the exact merged result that would be applied.

   - Do NOT modify any files yet.
   - Ask for explicit approval before applying changes.
   - After approval, apply the agreed resolution and complete the merge.

7. If the merge succeeds:
   - Push $1 to origin.

8. Create a new branch named $2.
   - Abort if a branch with this name already exists locally or remotely.
   - The new branch must be created from the updated $1.

9. Push the new branch to origin and set upstream tracking.

10. Provide a concise summary of:
   - Commit message created (if any)
   - Merge result
   - New branch created
   - Push results