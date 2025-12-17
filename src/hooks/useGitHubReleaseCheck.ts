import { getVersion } from '@tauri-apps/api/app';
import { message } from '@tauri-apps/plugin-dialog';

export function useGitHubReleaseCheck()
{
	const getUpdateUrl = async (): Promise<string> =>
	{
		try
		{
			for (let page = 1;; page++)
			{
				const githubApiUrl = `https://api.github.com/repos/immorrtalz/Hydryl/releases?per_page=5&page=${page}`;
				const response = await fetch(githubApiUrl);

				if (!response.ok)
				{
					await message(`GitHub API error: Status ${response.status}`, { title: "Couldn't check for an update", kind: 'error' });
					return "";
				}

				const data = await response.json();

				for (let i = 0; i < data.length; i++)
				{
					const release = data[i];

					const isStableRelease = !release.prerelease && !/[a-zA-Z&&[^vV]]/.test(release.tag_name);
					if (!isStableRelease) continue;

					const releaseVersion = release.tag_name.replace(/[a-zA-Z]/g, '');
					const currentVersion = await getVersion();

					if (release.tag_name && releaseVersion > currentVersion)
					{
						var downloadLink = "";

						for (let j = 0; j < release.assets.length; j++)
						{
							if (release.assets[j].name.endsWith(".apk"))
							{
								downloadLink = release.assets[j].browser_download_url;
								break;
							}
						}

						return downloadLink;
					}
				}

				if (data.length < 5) return "";
			}
		}
		catch (e)
		{
			await message(e instanceof Error ? e.message : String(e), { title: "Couldn't check for an update", kind: 'error' });
			return "";
		}
	};

	return { getUpdateUrl };
}