/**
 * @title Hello World
 * @resource {https://campsite.com/docs} Campsite docs
 * @description This is a simple script to create a post on Campsite. Use it as a starting point for other scripts.
 */

const CONTENT = `Hello world`;
const PROJECT_ID = "0l96cxq9jb83";

async function main() {
	const body = {
		title: "Hello World",
		content_markdown: CONTENT,
		project_id: PROJECT_ID,
	};

	const response = await fetch("https://api.campsite.co/v2/posts", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${Deno.env.get("CAMPSITE_API_KEY")}`,
		},
		body: JSON.stringify(body),
	});

	console.log(await response.json());
}

await main();
