const state = {
  username: "YOUR_GITHUB_USERNAME",
  theme: localStorage.getItem("portfolio-theme") || "light",
};

const $ = (id) => document.getElementById(id);

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  $("themeToggle").textContent = theme === "dark" ? "Light mode" : "Dark mode";
  localStorage.setItem("portfolio-theme", theme);
  state.theme = theme;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "Accept": "application/vnd.github+json" }
  });
  if (!response.ok) throw new Error(`GitHub API error ${response.status}`);
  return response.json();
}

function detectCategory(repo) {
  const text = `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();
  if (text.includes("aks") || text.includes("kubernetes")) return "Kubernetes / AKS";
  if (text.includes("docker") || text.includes("flask")) return "Docker";
  if (text.includes("devops") || text.includes("pipeline")) return "DevOps / CI-CD";
  if (text.includes("network") || text.includes("vnet") || text.includes("vpn")) return "Networking";
  if (text.includes("terraform")) return "Terraform";
  if (text.includes("ai") || text.includes("copilot")) return "AI / Copilot";
  return "Learning Project";
}

function repoSummary(repo) {
  const desc = repo.description || "No description added yet.";
  return desc.length > 180 ? desc.slice(0, 180).trim() + "..." : desc;
}

function starsLabel(repo) {
  return repo.stargazers_count > 0 ? `${repo.stargazers_count} ⭐` : "No stars yet";
}

function renderRepoCard(repo, readmeHtml = "") {
  const topics = (repo.topics || []).slice(0, 4);
  return `
    <article class="project-card">
      <div class="project-meta">
        <span class="badge">${detectCategory(repo)}</span>
        <span class="badge">${repo.language || "Mixed"}</span>
        <span class="badge">${starsLabel(repo)}</span>
      </div>
      <h3>${repo.name}</h3>
      <p>${repoSummary(repo)}</p>
      <div class="project-meta">
        ${topics.map(topic => `<span class="badge">${topic}</span>`).join("")}
      </div>
      <div class="project-meta" style="margin-top:14px">
        <a class="btn btn-primary" href="${repo.html_url}" target="_blank" rel="noreferrer">Open Repo</a>
        ${repo.homepage ? `<a class="btn btn-secondary" href="${repo.homepage}" target="_blank" rel="noreferrer">Live Demo</a>` : ""}
      </div>
      <div style="margin-top:14px; color: var(--muted); font-size: 14px;">
        Last updated: ${new Date(repo.updated_at).toLocaleDateString()}
      </div>
    </article>
  `;
}

async function loadGitHubProfile() {
  const username = $("githubusername").value.trim();
  if (!username || username === "YOUR_GITHUB_USERNAME") {
    alert("Please enter your GitHub username.");
    return;
  }
  state.username = username;

  try {
    const profile = await fetchJson(`https://api.github.com/users/${username}`);
    const repos = await fetchJson(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`);

    $("avatar").src = profile.avatar_url;
    $("profileName").textContent = profile.name || profile.login;
    $("profileBio").textContent = profile.bio || "Add a GitHub bio to make this section stronger.";
    $("followers").textContent = profile.followers ?? 0;
    $("following").textContent = profile.following ?? 0;
    $("reposCount").textContent = profile.public_repos ?? repos.length;
    $("starsCount").textContent = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    $("profileLink").href = profile.html_url;
    $("githubRepoLink").href = profile.html_url;

    $("metricProjects").textContent = repos.length;
    $("metricRepos").textContent = profile.public_repos ?? repos.length;

    $("projectsGrid").innerHTML = repos.length
      ? repos.map(repo => renderRepoCard(repo)).join("")
      : `<article class="project-skeleton">No public repositories found.</article>`;
  } catch (error) {
    console.error(error);
    $("projectsGrid").innerHTML = `<article class="project-skeleton">Unable to load GitHub data right now.</article>`;
  }
}

$("themeToggle").addEventListener("click", () => {
  setTheme(state.theme === "dark" ? "light" : "dark");
});

$("loadGithub").addEventListener("click", loadGitHubProfile);

setTheme(state.theme);
loadGitHubProfile();