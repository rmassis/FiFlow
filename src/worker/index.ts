import { Hono } from "hono";
import api from "@/server/api";
import goalsApi from "@/server/goals-api";
import insightsApi from "@/server/insights-api";
import dashboardApi from "@/server/dashboard-api";
import agentApi from "@/server/agent-api";

const app = new Hono<{ Bindings: Env }>();

app.route("/", api);
app.route("/", goalsApi);
app.route("/", insightsApi);
app.route("/", dashboardApi);
app.route("/", agentApi);

export default app;
