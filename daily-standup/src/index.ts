import "dotenv/config";
import cron from "node-cron";

// Monday-Friday at 9:30 PM UTC
const SCHEDULE = "30 21 * * 1-5";

const MEMBERS = [
	"3hsr0vv6fb75", // Brian,
	"mqasgn0wm7so", // Ryan,
	"ntpdpqcg879d", // Nick,
	"znvznmxcpiel", // Dan,
	"et8fwvr2jttt", // Alexandru,
];

const MENTIONS = MEMBERS.map((id) => `<@${id}>`).join(" ");

const CONTENT = `What did you work on today?\n\n${MENTIONS}`;

const DAILY_UPDATES_PROJECT_ID = "0l96cxq9jb83";

cron.schedule(SCHEDULE, async () => {
	const title = new Date().toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	const body = {
		title,
		content_markdown: CONTENT,
		project_id: DAILY_UPDATES_PROJECT_ID,
	};

	const response = await fetch("https://api.campsite.co/v2/posts", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.CAMPSITE_API_KEY}`,
		},
		body: JSON.stringify(body),
	});

	console.log(await response.json());
});
