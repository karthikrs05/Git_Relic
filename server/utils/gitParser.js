import { simpleGit } from 'simple-git';

export async function parseGitHistory(projectPath) {
  try {
    const git = simpleGit(projectPath);

    // Get commit count
    const allLogs = await git.log();
    const commitCount = allLogs.total;

    // Get last activity date
    const lastCommit = await git.log({ n: 1 });
    const lastActivity = lastCommit.latest?.date || new Date();

    // Get commit messages
    const logs = await git.log({ n: 10 });
    const commits = logs.all.map(log => ({
      hash: log.hash,
      message: log.message,
      author: log.author_name,
      date: log.date,
    }));

    return {
      commitCount,
      lastActivity,
      commits,
    };
  } catch (error) {
    console.error('Git parsing error:', error.message);
    return {
      commitCount: 0,
      lastActivity: new Date(),
      commits: [],
    };
  }
}
