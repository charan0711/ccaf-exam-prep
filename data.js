// Claude Certified Architect - Foundations (CCAR-F) Complete Study Guide
// Full interactive course data

const COURSE_DATA = {
  examInfo: {
    name: "Claude Certified Architect — Foundations (CCAR-F)",
    questions: 60,
    duration: "120 minutes",
    passingScore: 720,
    maxScore: 1000,
    price: "$125",
    validity: "12 months",
    delivery: "Pearson VUE (online or test center)",
    scenarios: "4 of 6 randomly selected per exam",
    access: "Anthropic Partner Academy (claude.com/partners)"
  },

  chapters: [
    {
      id: 1,
      title: "Agentic Architecture & Orchestration",
      weight: "27%",
      icon: "🤖",
      description: "The biggest domain. Agent loops, stop_reason, hooks, multi-agent patterns, coordinator-subagent topology.",
      sections: [
        {
          title: "The Platform Primitive",
          type: "lesson",
          content: `
<h2>🎯 Everything Starts Here</h2>
<p>The entire Claude platform — every agent, every workflow, every tool call — runs on <strong>one single API call</strong>:</p>

<div class="code-block">response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}]
)
print(response.stop_reason)  # "end_turn"</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Every agent you'll ever build is just this call inside a loop. The loop checks <code>stop_reason</code> to decide what to do next.</div>

<h3>The Response Object</h3>
<p>When Claude responds, you get back:</p>
<ul>
<li><code>content</code> — what the model said (text blocks and/or tool_use blocks)</li>
<li><code>stop_reason</code> — WHY the model stopped generating</li>
<li><code>usage</code> — token counts (input, output, cache hits)</li>
<li><code>model</code> — which model actually ran</li>
</ul>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> The exam loves testing whether you know that <code>stop_reason</code> is the control mechanism, not the content. Never parse the text to figure out what happened — always branch on <code>stop_reason</code>.</div>
`
        },
        {
          title: "The stop_reason Decision Tree",
          type: "lesson",
          content: `
<h2>🌳 The Six stop_reason Values</h2>
<p>This is the most important concept in Domain 1. Your agent's behavior is driven entirely by which <code>stop_reason</code> comes back:</p>

<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-family: monospace;">end_turn</td>
<td style="padding: 8px;">Model is done talking. Return response to user.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-family: monospace;">tool_use</td>
<td style="padding: 8px;">Model wants to call a tool. Execute it, append result, continue loop.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-family: monospace;">max_tokens</td>
<td style="padding: 8px;">Hit the token limit. Response is truncated — you need to handle continuation.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-family: monospace;">stop_sequence</td>
<td style="padding: 8px;">Hit a custom stop sequence you defined. Used for structured parsing.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-family: monospace;">pause_turn</td>
<td style="padding: 8px;">Agent SDK pause — model yielded control but isn't done. Resume or fork.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-family: monospace;">refusal</td>
<td style="padding: 8px;">Model refused the request (safety/policy). Handle gracefully.</td>
</tr>
</table>

<div class="warning-point">⚠️ <strong>Anti-Pattern:</strong> "The model said 'thank you' so I assume it's done." NEVER parse text to detect completion. Always branch on <code>stop_reason</code>. This is how production agents go feral.</div>

<h3>The Loop in Pseudocode</h3>
<div class="code-block">while True:
    response = client.messages.create(...)
    
    if response.stop_reason == "end_turn":
        return response.content  # Done!
    
    elif response.stop_reason == "tool_use":
        tool_result = execute_tool(response.content)
        messages.append(assistant_msg)
        messages.append(tool_result_msg)
        continue  # Loop again
    
    elif response.stop_reason == "max_tokens":
        # Handle truncation - maybe continue or summarize
        break
    
    elif response.stop_reason == "refusal":
        # Model refused - log and handle gracefully
        break</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> Questions will describe agent behavior and ask "what went wrong?" The answer is almost always: they didn't branch on stop_reason correctly, or they assumed end_turn when they got tool_use.</div>
`
        },
        {
          title: "The Agentic Loop - Full Implementation",
          type: "lesson",
          content: `
<h2>🔄 Building the Complete Agent Loop</h2>
<p>Now let's build a real agent loop step by step. This is what runs inside every Claude agent — from simple chatbots to complex multi-agent systems.</p>

<h3>Step 1: Define Your Tools</h3>
<div class="code-block">tools = [
    {
        "name": "lookup_customer",
        "description": "Look up customer by ID. Returns name, email, plan, and account status. Use when the user mentions a customer or you need account details.",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_id": {
                    "type": "string",
                    "description": "The unique customer identifier (e.g., CUST-12345)"
                }
            },
            "required": ["customer_id"]
        }
    },
    {
        "name": "process_refund",
        "description": "Process a refund for a customer. Maximum allowed: $500. Use ONLY after confirming the customer's identity and the specific charge. Never process without explicit user confirmation.",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_id": {"type": "string"},
                "amount": {"type": "number", "description": "Refund amount in USD"},
                "reason": {"type": "string"}
            },
            "required": ["customer_id", "amount", "reason"]
        }
    }
]</div>

<div class="key-point">💡 <strong>Key Insight:</strong> The <code>description</code> field is the contract, not the tool name. Put behavior rules, limits, and when-to-use/when-not-to-use guidance in the description. Names can lie; descriptions shouldn't.</div>

<h3>Step 2: The Agent Loop</h3>
<div class="code-block">import anthropic

client = anthropic.Anthropic()

def run_agent(user_message, system_prompt="You are a helpful support agent."):
    messages = [{"role": "user", "content": user_message}]
    
    while True:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=system_prompt,
            tools=tools,
            messages=messages
        )
        
        # Always branch on stop_reason
        if response.stop_reason == "end_turn":
            # Extract text from content blocks
            text = "".join(
                block.text for block in response.content 
                if block.type == "text"
            )
            return text
        
        elif response.stop_reason == "tool_use":
            # Append assistant message (contains tool_use blocks)
            messages.append({"role": "assistant", "content": response.content})
            
            # Execute each tool call
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })
            
            messages.append({"role": "user", "content": tool_results})
        
        else:
            # max_tokens, refusal, etc.
            return f"Agent stopped: {response.stop_reason}"</div>

<h3>Step 3: Tool Execution</h3>
<div class="code-block">def execute_tool(name, inputs):
    if name == "lookup_customer":
        # In production: call your database
        return json.dumps({
            "name": "Alice Johnson",
            "email": "alice@example.com",
            "plan": "Pro",
            "status": "active"
        })
    elif name == "process_refund":
        amount = inputs["amount"]
        if amount > 500:
            return json.dumps({
                "isError": True,
                "errorCategory": "policy",
                "isRetryable": False,
                "message": f"Refund of ${amount} exceeds $500 policy limit"
            })
        return json.dumps({"success": True, "refund_id": "REF-98765"})
    else:
        return json.dumps({"isError": True, "message": f"Unknown tool: {name}"})</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Return structured errors with <code>isError</code>, <code>errorCategory</code> (transient/permanent/policy), and <code>isRetryable</code>. The model uses these fields to decide whether to retry, reformulate, or tell the user.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> The exam tests whether you know the correct message structure: assistant messages contain tool_use blocks, and the next user message contains corresponding tool_result blocks matched by <code>tool_use_id</code>.</div>
`
        },
        {
          title: "Hooks - Deterministic Backstops",
          type: "lesson",
          content: `
<h2>🛡️ Hooks: When Prompts Aren't Enough</h2>
<p>The model usually cooperates with instructions. But "usually" isn't production-grade. <strong>Hooks</strong> are code-level gates that fire at specific lifecycle events — they're your deterministic backstop.</p>

<h3>Why Hooks Exist</h3>
<p>Defense in depth has three layers:</p>
<ol>
<li><strong>Prompt layer</strong> — system prompt says "don't refund over $500"</li>
<li><strong>Tool description</strong> — tool description says "maximum $500"</li>
<li><strong>Hook (application layer)</strong> — code that blocks the call if amount > 500</li>
</ol>
<p>Layers 1 and 2 are suggestions. Layer 3 is a guarantee.</p>

<h3>Hook Lifecycle Events</h3>
<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light);">PreToolUse</td>
<td style="padding: 8px;">Gate a tool call BEFORE it executes. Can block or modify.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light);">PostToolUse</td>
<td style="padding: 8px;">Audit/transform AFTER a tool returns. Log, filter, or enrich results.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light);">SessionStart</td>
<td style="padding: 8px;">Inject context at the beginning of a session (user prefs, policies).</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light);">Stop</td>
<td style="padding: 8px;">Final verification before response goes to user.</td>
</tr>
</table>

<h3>Implementation Example: Refund Policy Hook</h3>
<div class="code-block">REFUND_CAP = 500

def enforce_refund_policy(tool_name, tool_input):
    """PreToolUse hook - blocks refunds over the cap."""
    if tool_name != "process_refund":
        return {"allowed": True}  # Not our concern
    
    amount = tool_input.get("amount", 0)
    if amount > REFUND_CAP:
        return {
            "allowed": False,
            "error": {
                "isError": True,
                "errorCategory": "policy",
                "isRetryable": False,
                "message": f"Blocked: ${amount} exceeds ${REFUND_CAP} refund cap. Escalate to manager."
            }
        }
    return {"allowed": True}

# In the agent loop, before executing:
def run_agent_with_hook(user_message):
    # ... same loop as before, but before execute_tool:
    for block in response.content:
        if block.type == "tool_use":
            # Hook fires FIRST
            hook_result = enforce_refund_policy(block.name, block.input)
            if not hook_result["allowed"]:
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(hook_result["error"])
                })
            else:
                # Tool executes normally
                result = execute_tool(block.name, block.input)
                tool_results.append({...})</div>

<div class="warning-point">⚠️ <strong>Critical:</strong> A hook error should FAIL CLOSED. If the hook itself crashes, block the tool call and log loudly. Silent hook failures = policy quietly evaporating.</div>

<h3>Claude Code Hook Configuration</h3>
<p>In Claude Code, hooks are configured in <code>settings.json</code>:</p>
<div class="code-block">{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "process_refund",
        "command": "python /path/to/validate_refund.py"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "command": "python /path/to/audit_log.py"
      }
    ]
  }
}</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "Where should this policy live?" If it MUST hold (compliance, security, money), the answer is a hook/application-layer code. If it's a preference or guideline, prompt layer is fine. The exam tests this distinction heavily.</div>
`
        },
        {
          title: "Multi-Agent Patterns",
          type: "lesson",
          content: `
<h2>🏗️ Coordinator-Subagent Architecture</h2>
<p>When a single agent gets too complex, you split it into specialized agents. The exam loves this topic because it's where most production architectures live.</p>

<h3>When to Split</h3>
<ul>
<li>Subtasks have <strong>independent success criteria</strong></li>
<li>Context bloat is hurting answer quality (too many tools, too much history)</li>
<li>You need <strong>per-agent tool scope</strong> (research agent shouldn't have write access)</li>
<li>Different subtasks need different models (cheap model for triage, capable model for synthesis)</li>
</ul>

<h3>When NOT to Split</h3>
<ul>
<li>Subtasks share state heavily — splitting forces serialization, doubles context cost</li>
<li>The task is simple enough for one agent with clear tools</li>
<li>You're splitting for "theoretical purity" rather than solving a real problem</li>
</ul>

<h3>The Hub-and-Spoke Pattern</h3>
<div class="code-block">┌─────────────────────────────────────┐
│          COORDINATOR                 │
│  - Receives user request             │
│  - Decides which subagent(s) to use  │
│  - Synthesizes final response        │
│  - Maintains conversation state      │
└──────────┬──────────┬───────────────┘
           │          │
    ┌──────▼──┐  ┌───▼────────┐
    │ RESEARCH │  │ SYNTHESIS  │
    │ Subagent │  │ Subagent   │
    │          │  │            │
    │ Tools:   │  │ Tools:     │
    │ - search │  │ - format   │
    │ - fetch  │  │ - cite     │
    │ - read   │  │ - validate │
    └──────────┘  └────────────┘</div>

<h3>Context Isolation</h3>
<p>The critical principle: <strong>subagent messages never leak into the coordinator's message array</strong>. Each subagent runs its own <code>client.messages.create</code> loop. Only the final output gets passed back.</p>

<div class="code-block">def run_subagent(role, task, tools):
    """Each subagent gets its own isolated conversation."""
    messages = [{"role": "user", "content": task}]
    
    while True:
        response = client.messages.create(
            model="claude-haiku-4-5-20251016",  # Cheap for subtasks
            system=f"You are a {role} specialist.",
            tools=tools,
            messages=messages  # ISOLATED from coordinator
        )
        if response.stop_reason == "end_turn":
            return extract_text(response)
        # ... handle tool_use within subagent's scope

def coordinator(user_request):
    """Coordinator dispatches and synthesizes."""
    # Step 1: Research
    research = run_subagent(
        role="research",
        task=f"Find relevant info for: {user_request}",
        tools=research_tools  # Scoped!
    )
    
    # Step 2: Synthesize
    synthesis = run_subagent(
        role="synthesis",
        task=f"Create a summary from: {research}",
        tools=synthesis_tools  # Scoped!
    )
    
    return synthesis</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Context isolation means each subagent can't see the other's tool calls or internal reasoning. The coordinator only passes the final output forward. This prevents cross-contamination and keeps context windows clean.</div>

<h3>Agent SDK Task Primitive</h3>
<p>The Claude Agent SDK packages this pattern as <code>Task</code>:</p>
<div class="code-block">from claude_agent_sdk import Agent, Task

research_agent = Agent(
    name="researcher",
    model="claude-haiku-4-5-20251016",
    tools=[search_tool, fetch_tool],
    system="You are a research specialist."
)

synthesis_agent = Agent(
    name="synthesizer",
    model="claude-sonnet-4-20250514",
    tools=[format_tool, cite_tool],
    system="You synthesize research into clear summaries."
)

# Task handles the loop, isolation, and result passing
task = Task(
    agents=[research_agent, synthesis_agent],
    coordinator_model="claude-sonnet-4-20250514"
)</div>

<h3>Session Resume vs Fork</h3>
<ul>
<li><strong>Resume</strong>: Continue an existing conversation. Same context, same state. Used when the user comes back to an ongoing task.</li>
<li><strong>Fork</strong>: Branch from a point in history. New independent conversation with shared history up to the fork point. Used for parallel exploration.</li>
</ul>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "What pattern isolates subagent context?" → Coordinator-subagent with separate message arrays. "What pattern gives subagents scoped tools?" → Same. "When should you use a single agent?" → When subtasks share heavy state and splitting would serialize data flow.</div>
`
        },
        {
          title: "Agent SDK Deep Dive",
          type: "lesson",
          content: `
<h2>⚙️ The Claude Agent SDK</h2>
<p>The Agent SDK (formerly "Claude Code SDK") is Anthropic's official framework for building production agents. It wraps the patterns we've covered into a structured API.</p>

<h3>Core Concepts</h3>
<ul>
<li><strong>Agent</strong> — defines a model, tools, system prompt, and configuration</li>
<li><strong>Task</strong> — a unit of work assigned to one or more agents</li>
<li><strong>Hook</strong> — lifecycle callbacks (PreToolUse, PostToolUse, etc.)</li>
<li><strong>settingSources</strong> — loads CLAUDE.md from user and project levels</li>
</ul>

<h3>Lifecycle Hooks in the SDK</h3>
<div class="code-block">from claude_agent_sdk import Agent, Hook

class RefundPolicyHook(Hook):
    event = "PreToolUse"
    
    def should_fire(self, tool_name):
        return tool_name == "process_refund"
    
    def execute(self, tool_name, tool_input):
        if tool_input.get("amount", 0) > 500:
            return {
                "block": True,
                "message": "Refund exceeds $500 policy cap. Escalate."
            }
        return {"block": False}

agent = Agent(
    name="support-agent",
    model="claude-sonnet-4-20250514",
    tools=[lookup_tool, refund_tool],
    hooks=[RefundPolicyHook()],
    system="You are a customer support agent. Follow company policy."
)</div>

<h3>Production Patterns</h3>

<p><strong>1. Graceful Degradation:</strong></p>
<div class="code-block"># If the primary model is down, fall back
agent = Agent(
    model="claude-sonnet-4-20250514",
    fallback_model="claude-haiku-4-5-20251016",
    max_retries=3,
    retry_delay=1.0  # seconds
)</div>

<p><strong>2. Observability:</strong></p>
<div class="code-block"># Log every decision point
agent = Agent(
    on_tool_call=lambda name, input: logger.info(f"Tool: {name}"),
    on_stop=lambda reason: logger.info(f"Stop: {reason}"),
    on_error=lambda err: logger.error(f"Error: {err}")
)</div>

<p><strong>3. Token Budget Management:</strong></p>
<div class="code-block"># Set guardrails on context size
agent = Agent(
    max_tokens=4096,
    max_conversation_turns=20,
    context_window_strategy="summarize_early"  
    # Options: "summarize_early", "truncate_old", "error"
)</div>

<div class="key-point">💡 <strong>Key Insight:</strong> The Agent SDK loads settings from both <code>~/.claude/CLAUDE.md</code> (user) and <code>./CLAUDE.md</code> (project) via <code>settingSources: ["user", "project"]</code>. This means team conventions cascade into every agent automatically.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> Know the difference between the raw Messages API (you manage the loop) and the Agent SDK (it manages the loop). The exam tests both. The SDK is convenience; the Messages API is the truth underneath.</div>
`
        },
        {
          title: "Domain 1 Interactive Quiz",
          type: "quiz",
          questions: [
            {
              q: "An agent processes a customer request and receives stop_reason='tool_use'. What should the loop do next?",
              options: [
                "Return the response to the user",
                "Execute the requested tool, append the result, and continue the loop",
                "Ask the user for confirmation before proceeding",
                "Check if max_tokens was reached"
              ],
              correct: 1,
              explanation: "When stop_reason is 'tool_use', the model wants to call a tool. Execute it, append the tool_result to messages, and continue the loop. The model hasn't finished yet."
            },
            {
              q: "A financial services company requires that no transaction over $10,000 can be processed without human approval. Where should this rule be enforced?",
              options: [
                "In the system prompt only",
                "In the tool description only",
                "In a PreToolUse hook (application-layer code)",
                "In the model's temperature setting"
              ],
              correct: 2,
              explanation: "Compliance/financial rules that MUST hold belong in application-layer code (hooks). Prompts and descriptions are suggestions — the model can ignore them. A PreToolUse hook is a deterministic guarantee."
            },
            {
              q: "In a coordinator-subagent architecture, what prevents one subagent from seeing another subagent's internal tool calls?",
              options: [
                "Access control lists on tools",
                "Separate message arrays for each subagent",
                "Encryption of tool results",
                "Rate limiting between agents"
              ],
              correct: 1,
              explanation: "Context isolation is achieved by giving each subagent its own messages array. The coordinator only passes the final output between agents, never the internal conversation history or tool calls."
            },
            {
              q: "Your agent's hook function throws an unhandled exception. What is the correct behavior?",
              options: [
                "Skip the hook and execute the tool anyway",
                "Retry the hook 3 times then proceed",
                "Fail closed — block the tool call and log the error",
                "Return a generic success response"
              ],
              correct: 2,
              explanation: "Hooks should FAIL CLOSED. If the hook itself fails, that means you cannot verify the policy, so you must block the action. Silent hook failures are how policy quietly evaporates in production."
            },
            {
              q: "When should you prefer a single agent over a coordinator-subagent split?",
              options: [
                "When you want better observability",
                "When subtasks share heavy state and splitting would force serialization",
                "When you have more than 5 tools",
                "When using the Agent SDK"
              ],
              correct: 1,
              explanation: "If subtasks share heavy state, splitting forces you to serialize that state between agents, doubling context cost. Keep it as one agent when the overhead of splitting outweighs the benefits."
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Tool Design & MCP Integration",
      weight: "18%",
      icon: "🔧",
      description: "Tool definitions, MCP servers, transports, resources, prompts, and structured error patterns.",
      sections: [
        {
          title: "Tool Definition Anatomy",
          type: "lesson",
          content: `
<h2>🔧 Writing Tools That Work</h2>
<p>A tool definition has three parts: <code>name</code>, <code>description</code>, and <code>input_schema</code>. The model reads ALL of these to decide when and how to call a tool.</p>

<h3>The Complete Tool Shape</h3>
<div class="code-block">{
    "name": "search_knowledge_base",
    "description": "Search the internal knowledge base for product documentation and support articles. Use this when the user asks about product features, troubleshooting steps, or company policies. Do NOT use for billing questions (use lookup_billing instead). Returns top 5 matching articles with relevance scores.",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Natural language search query. Be specific — include product names, error codes, or feature names when available."
            },
            "category": {
                "type": "string",
                "enum": ["product", "troubleshooting", "policy", "all"],
                "description": "Filter results by category. Use 'all' if unsure."
            },
            "max_results": {
                "type": "integer",
                "description": "Number of results to return (1-10). Default: 5."
            }
        },
        "required": ["query"]
    },
    "cache_control": {"type": "ephemeral"}
}</div>

<h3>Description Best Practices</h3>
<div class="key-point">💡 A good description answers five questions:
<ol>
<li>What does this tool do?</li>
<li>When should the model call it?</li>
<li>When should the model NOT call it?</li>
<li>What do the inputs mean?</li>
<li>What does the output look like (success + failure)?</li>
</ol></div>

<h3>Bad vs Good Tool Descriptions</h3>
<p><strong>❌ Bad:</strong></p>
<div class="code-block">"description": "Searches the database"</div>
<p><strong>✅ Good:</strong></p>
<div class="code-block">"description": "Search the customer orders database by order ID, email, or date range. Returns order status, items, and tracking info. Use when user asks about an existing order. Do NOT use for creating new orders (use create_order). Returns empty array if no matches found."</div>

<div class="warning-point">⚠️ <strong>Anti-Pattern:</strong> Relying on tool names to convey behavior. The model may pick <code>get_data</code> when it should pick <code>search_records</code> if descriptions are vague. Names are labels; descriptions are contracts.</div>

<h3>Structured Error Returns</h3>
<p>When a tool fails, return a structured error so the model knows what to do:</p>
<div class="code-block">{
    "isError": true,
    "errorCategory": "transient",   // transient | permanent | policy
    "isRetryable": true,
    "message": "Database connection timed out. Try again in 2 seconds.",
    "retryAfter": 2
}</div>

<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light);">transient</td>
<td style="padding: 8px;">Temporary failure (timeout, rate limit). Model should retry.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light);">permanent</td>
<td style="padding: 8px;">Can't be fixed by retrying (not found, invalid input). Model should tell user.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light);">policy</td>
<td style="padding: 8px;">Blocked by business rules. Model should explain the constraint or escalate.</td>
</tr>
</table>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "The agent keeps retrying a failed API call indefinitely. What's the fix?" → Return a structured error with <code>isRetryable: false</code> or <code>errorCategory: permanent</code>. The model needs structured signals, not bare error strings.</div>
`
        },
        {
          title: "tool_choice Modes",
          type: "lesson",
          content: `
<h2>🎛️ Controlling Tool Selection</h2>
<p>The <code>tool_choice</code> parameter tells Claude how much freedom it has in selecting tools.</p>

<h3>The Four Modes</h3>

<p><strong>1. Auto (default)</strong> — Model decides whether to use tools</p>
<div class="code-block">tool_choice = {"type": "auto"}
# Model can call tools, or just respond with text
# Add disable_parallel_tool_use: true if order matters</div>

<p><strong>2. Any</strong> — Must call SOME tool (doesn't matter which)</p>
<div class="code-block">tool_choice = {"type": "any"}
# Forces a tool call. Useful for classification steps
# or when you always need structured output</div>

<p><strong>3. Tool (forced)</strong> — Must call THIS specific tool</p>
<div class="code-block">tool_choice = {"type": "tool", "name": "extract_invoice"}
# The big one! Forces structured output by making the
# model call a specific tool (which has a schema).
# This is the canonical structured output pattern.</div>

<p><strong>4. None</strong> — No tools allowed this turn</p>
<div class="code-block">tool_choice = {"type": "none"}
# Temporarily disable tools. Useful for getting the
# model to summarize or explain without taking action.</div>

<h3>Parallel Tool Use Control</h3>
<div class="code-block">response = client.messages.create(
    model="claude-sonnet-4-20250514",
    tools=tools,
    tool_choice={
        "type": "auto",
        "disable_parallel_tool_use": True  # Sequential only
    },
    messages=messages
)</div>

<p>Set <code>disable_parallel_tool_use: true</code> when:</p>
<ul>
<li>Tool B depends on Tool A's output</li>
<li>Order matters (e.g., check balance THEN transfer)</li>
<li>You need deterministic execution traces for auditing</li>
</ul>

<div class="key-point">💡 <strong>The Forced Tool Call Pattern</strong> (you'll use this A LOT):
<ol>
<li>Define a tool whose input_schema is your desired output format</li>
<li>Set <code>tool_choice: {"type": "tool", "name": "your_schema_tool"}</code></li>
<li>Model MUST produce data matching that schema</li>
<li>Validate with Pydantic on your side</li>
<li>If validation fails, append the error and retry (with a ceiling)</li>
</ol>
This is the production-grade way to get structured JSON from Claude.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "When should you use tool_choice: any vs tool_choice: tool?" → Use <code>any</code> when the model should pick which tool but must pick one. Use <code>tool</code> when you need a specific schema enforced. The exam distinguishes these precisely.</div>
`
        },
        {
          title: "Model Context Protocol (MCP)",
          type: "lesson",
          content: `
<h2>🌐 MCP: The Universal Tool Protocol</h2>
<p>MCP (Model Context Protocol) is an open standard for connecting AI models to external tools and data sources. Think of it as USB for AI — a universal connector.</p>

<h3>MCP Architecture</h3>
<div class="code-block">┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  AI Model    │────▶│  MCP Client  │────▶│  MCP Server  │
│  (Claude)    │◀────│  (your app)  │◀────│  (tools)     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                          ┌───────┼───────┐
                                          ▼       ▼       ▼
                                        Tools  Resources  Prompts</div>

<h3>MCP Server Primitives</h3>
<ul>
<li><strong>Tools</strong> — Functions the model can call (search, create, update, delete)</li>
<li><strong>Resources</strong> — Data the model can read (files, database records, configs)</li>
<li><strong>Prompts</strong> — Pre-built prompt templates the server offers</li>
</ul>

<h3>Three Transport Types</h3>

<p><strong>1. stdio</strong> — Local process, communicate via stdin/stdout</p>
<div class="code-block">{
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/docs"],
            "env": {}
        }
    }
}</div>

<p><strong>2. SSE (Server-Sent Events)</strong> — Remote server, HTTP streaming</p>
<div class="code-block">{
    "mcpServers": {
        "knowledge-base": {
            "type": "sse",
            "url": "https://mcp.mycompany.com/sse",
            "headers": {
                "Authorization": "Bearer \${API_TOKEN}"
            }
        }
    }
}</div>

<p><strong>3. HTTP</strong> — Remote server, request/response</p>
<div class="code-block">{
    "mcpServers": {
        "api-gateway": {
            "type": "http",
            "url": "https://mcp.mycompany.com/api",
            "headers": {
                "X-API-Key": "\${MCP_API_KEY}"
            }
        }
    }
}</div>

<h3>Environment Variable Expansion</h3>
<p><code>\${ENV_VAR}</code> works in <code>env</code>, <code>args</code>, and <code>headers</code>. Never commit literal secrets.</p>

<div class="warning-point">⚠️ <strong>Security Rule:</strong> Never put actual secrets in <code>.mcp.json</code>. Always use <code>\${ENV_VAR}</code> expansion. The config file gets checked into source control; the env vars don't.</div>

<h3>Building an MCP Server (FastMCP)</h3>
<div class="code-block">from fastmcp import FastMCP

mcp = FastMCP("my-tools")

@mcp.tool()
def search_docs(query: str, limit: int = 5) -> str:
    """Search documentation by keyword. Returns top matches."""
    results = db.search(query, limit=limit)
    return json.dumps(results)

@mcp.resource("config://app")
def get_config() -> str:
    """Current application configuration."""
    return json.dumps(load_config())

@mcp.prompt("summarize")
def summarize_prompt(text: str) -> str:
    """Generate a prompt for summarizing text."""
    return f"Summarize the following in 3 bullet points:\\n\\n{text}"

if __name__ == "__main__":
    mcp.run(transport="stdio")</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> Know the three MCP primitives (tools, resources, prompts), the three transports (stdio, SSE, HTTP), and that <code>\${ENV_VAR}</code> keeps secrets out of config files. The exam will give you a scenario and ask which transport is appropriate.</div>
`
        },
        {
          title: "Tool Caching",
          type: "lesson",
          content: `
<h2>💾 Prompt Caching for Tools</h2>
<p>Tool definitions are sent with every API call. If you have 10 tools, that's a lot of tokens repeated. Caching saves money and latency.</p>

<h3>How It Works</h3>
<div class="code-block">tools = [
    {"name": "tool_1", "description": "...", "input_schema": {...}},
    {"name": "tool_2", "description": "...", "input_schema": {...}},
    {
        "name": "tool_3", 
        "description": "...", 
        "input_schema": {...},
        "cache_control": {"type": "ephemeral"}  # Cache marker!
    }
]</div>

<p>Put <code>cache_control</code> on the LAST tool in the list. Anthropic caches everything up to and including that marker.</p>

<h3>Verifying Cache Hits</h3>
<div class="code-block">response = client.messages.create(
    model="claude-sonnet-4-20250514",
    tools=tools,
    messages=messages
)

# First call: cache WRITE
print(response.usage.cache_creation_input_tokens)  # > 0

# Second call (within ~5 min): cache READ
print(response.usage.cache_read_input_tokens)  # > 0</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Cache reads are ~90% cheaper than cache writes. The ephemeral TTL is roughly 5 minutes. If your tool definitions don't change between calls (they usually don't), caching is essentially free money.</div>

<h3>What Can Be Cached</h3>
<ul>
<li>Tool definitions (mark last tool with cache_control)</li>
<li>System prompts (mark with cache_control)</li>
<li>Long user messages (mark with cache_control)</li>
<li>Anything that repeats across calls and is >1024 tokens</li>
</ul>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "How do you verify caching is working?" → Check <code>cache_creation_input_tokens</code> on call 1 and <code>cache_read_input_tokens</code> on call 2. If both are 0, caching isn't set up correctly.</div>
`
        },
        {
          title: "Domain 2 Interactive Quiz",
          type: "quiz",
          questions: [
            {
              q: "A tool returns a bare string 'Error: connection timeout' when it fails. What's the problem?",
              options: [
                "The string is too short",
                "The model can't distinguish transient from permanent errors or know if it should retry",
                "Strings aren't valid tool_result content",
                "The error should be in the system prompt"
              ],
              correct: 1,
              explanation: "Without structured error fields (isError, errorCategory, isRetryable), the model has to guess whether to retry, reformulate, or give up. Structured errors give the model clear signals for decision-making."
            },
            {
              q: "You need the model to always produce JSON matching a specific schema. What's the correct approach?",
              options: [
                "Ask nicely in the system prompt to return JSON",
                "Set temperature to 0",
                "Define a tool with the schema and use tool_choice: {type: 'tool', name: '...'}",
                "Use stop_sequences to detect JSON"
              ],
              correct: 2,
              explanation: "The forced tool call pattern: define a tool whose input_schema is your desired output schema, then force the model to call it with tool_choice. This guarantees schema-conforming output."
            },
            {
              q: "Your MCP server runs locally and communicates via stdin/stdout. Which transport type is this?",
              options: [
                "HTTP",
                "SSE",
                "stdio",
                "WebSocket"
              ],
              correct: 2,
              explanation: "stdio transport runs a local process and communicates via standard input/output. It's the simplest transport for local tools that don't need network access."
            },
            {
              q: "Where should you put secrets needed by MCP servers?",
              options: [
                "Directly in .mcp.json",
                "In the tool description",
                "In environment variables referenced via ${ENV_VAR} in the config",
                "In the system prompt"
              ],
              correct: 2,
              explanation: "${ENV_VAR} expansion in .mcp.json keeps secrets out of source control. The config file is committed; the actual values live in environment variables that are never committed."
            },
            {
              q: "You want to prevent the model from calling tools during a specific turn (e.g., for a summary response). What do you set?",
              options: [
                "Remove all tools from the request",
                "Set tool_choice: {type: 'none'}",
                "Set temperature to 0",
                "Add 'do not use tools' to the prompt"
              ],
              correct: 1,
              explanation: "tool_choice: {type: 'none'} disables tool use for that specific turn while keeping the tools defined for future turns. This is cleaner than removing and re-adding tools."
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Claude Code Configuration & Workflows",
      weight: "20%",
      icon: "💻",
      description: "CLAUDE.md hierarchy, agent skills, plan mode, slash commands, CI/CD with claude -p.",
      sections: [
        {
          title: "CLAUDE.md Hierarchy",
          type: "lesson",
          content: `
<h2>📋 The Four-Tier Instruction System</h2>
<p>Claude Code reads instructions from CLAUDE.md files at multiple levels. Understanding the hierarchy and precedence is essential for the exam.</p>

<h3>The Four Levels (in precedence order)</h3>

<p><strong>1. User Level:</strong> <code>~/.claude/CLAUDE.md</code></p>
<ul>
<li>Your personal defaults, applied to EVERY project</li>
<li>Put: preferred coding style, language preferences, personal shortcuts</li>
<li>Don't put: team-specific rules (they'll leak into other projects)</li>
</ul>

<p><strong>2. Project Level:</strong> <code>./CLAUDE.md</code> (repo root)</p>
<ul>
<li>Team conventions, checked into source control</li>
<li>Put: tech stack, coding standards, testing requirements, architecture decisions</li>
<li>This is the most important one for team alignment</li>
</ul>

<p><strong>3. Subtree Level:</strong> <code>&lt;subdir&gt;/CLAUDE.md</code></p>
<ul>
<li>Loaded on-demand when files in that directory are read</li>
<li>Put: frontend-specific rules in <code>frontend/CLAUDE.md</code>, backend rules in <code>backend/CLAUDE.md</code></li>
<li>Keeps rules scoped — frontend patterns don't pollute backend files</li>
</ul>

<p><strong>4. Local Override:</strong> <code>CLAUDE.local.md</code></p>
<ul>
<li>Gitignored — personal overrides for this specific repo</li>
<li>Put: your local paths, personal API keys for dev, experimental settings</li>
<li>Never committed, never shared</li>
</ul>

<h3>Example Project CLAUDE.md</h3>
<div class="code-block"># Project: Customer Support Platform

## Tech Stack
- Backend: Python 3.12, FastAPI, PostgreSQL
- Frontend: React 18, TypeScript, Tailwind CSS
- Testing: pytest (backend), Vitest (frontend)

## Coding Standards
- All functions must have type hints
- All public APIs must have docstrings
- No bare except clauses
- Max function length: 50 lines

## Architecture
- Domain-driven design with clear bounded contexts
- All database access through repository pattern
- Events for cross-domain communication

## Testing Requirements
- Unit tests for all business logic
- Integration tests for API endpoints
- Minimum 80% coverage on new code

## Do NOT
- Use global state or singletons
- Import from internal modules of other domains
- Add dependencies without team discussion</div>

<h3>Path-Specific Rules</h3>
<p>For finer control, use <code>.claude/rules/</code> with glob patterns:</p>
<div class="code-block"># .claude/rules/frontend.md
---
paths: ["src/frontend/**", "*.tsx", "*.css"]
---

Use functional components only.
All components must be accessible (ARIA labels, keyboard nav).
Use Tailwind utility classes, not custom CSS.
Never use inline styles.</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Subtree CLAUDE.md files only load when Claude reads files in that directory. This means they don't waste context on unrelated work. A backend task never sees frontend rules.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "Where do team coding standards go?" → Project-level CLAUDE.md (committed). "Where do personal preferences go?" → User-level ~/.claude/CLAUDE.md. "Where do gitignored local overrides go?" → CLAUDE.local.md. The exam tests this mapping precisely.</div>
`
        },
        {
          title: "Claude Code CLI & CI/CD",
          type: "lesson",
          content: `
<h2>🚀 Claude Code in Automation</h2>
<p>Claude Code isn't just an interactive tool — it's a CLI you can pipe to. <code>claude -p</code> is headless mode, designed for scripts and CI/CD.</p>

<h3>Non-Interactive Mode: claude -p</h3>
<div class="code-block"># Basic usage — ask a question, get an answer
claude -p "List all Python files with missing docstrings"

# JSON output for scripting
claude -p "Analyze this PR for security issues" --output-format json

# Pipe input
cat error.log | claude -p "Summarize these errors and suggest fixes"

# With specific model
claude -p "Review this code" --model claude-sonnet-4-20250514</div>

<h3>CI/CD Integration</h3>
<div class="code-block"># GitHub Actions example
name: Claude Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Claude review
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "Review the diff in this PR. Focus on:
          1. Security vulnerabilities
          2. Performance issues
          3. Missing error handling
          Report findings as JSON." --output-format json > review.json</div>

<h3>Plan Mode</h3>
<p>In interactive Claude Code, <strong>Shift+Tab</strong> cycles through modes:</p>
<ul>
<li><strong>Normal mode</strong> — Claude reads and writes files</li>
<li><strong>Plan mode</strong> — Claude analyzes and plans but doesn't make changes</li>
</ul>
<p>Use Plan mode to explore and understand before committing to changes.</p>

<h3>Slash Commands</h3>
<div class="code-block">/init        — Initialize CLAUDE.md for this project
/compact     — Compress conversation history
/clear       — Clear conversation
/model       — Switch model mid-conversation
/permissions — Show/modify tool permissions</div>

<h3>Agent Skills</h3>
<p>Custom slash commands defined in <code>.claude/commands/</code>:</p>
<div class="code-block"># .claude/commands/review.md
Review the current file for:
1. Security issues (injection, XSS, auth bypass)
2. Performance (N+1 queries, unnecessary loops)
3. Error handling (bare excepts, silent failures)

Output a numbered list of findings with severity (HIGH/MED/LOW).</div>

<p>Then use: <code>/review</code> in Claude Code.</p>

<div class="key-point">💡 <strong>Key Insight:</strong> <code>claude -p</code> makes Claude Code scriptable. Anything you do interactively can be automated: code review, migration generation, test writing, documentation updates.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "How would you integrate Claude Code into a CI/CD pipeline?" → <code>claude -p</code> with <code>--output-format json</code>. "How do you explore without making changes?" → Plan mode (Shift+Tab). The exam loves testing automation patterns.</div>
`
        },
        {
          title: "Permissions & Security Model",
          type: "lesson",
          content: `
<h2>🔐 Claude Code Security</h2>
<p>Claude Code has a permission system that controls what tools the agent can use. Understanding this is critical for the exam's security questions.</p>

<h3>Permission Levels</h3>
<ul>
<li><strong>Ask</strong> — Prompt user for approval every time (default for destructive ops)</li>
<li><strong>Allow</strong> — Auto-approve for this session</li>
<li><strong>Always Allow</strong> — Auto-approve permanently (saved to settings)</li>
<li><strong>Deny</strong> — Block this tool entirely</li>
</ul>

<h3>Tool Categories</h3>
<div class="code-block">Read tools:   file_read, grep, find, list_directory
Write tools:  file_write, file_edit, create_directory
Shell tools:  bash, execute_command
Web tools:    web_search, web_fetch
MCP tools:    Any tools from MCP servers</div>

<h3>settings.json Permission Config</h3>
<div class="code-block">{
  "permissions": {
    "allow": [
      "read",           // All read tools
      "mcp:filesystem"  // Specific MCP server tools
    ],
    "deny": [
      "shell:rm -rf",   // Block specific dangerous commands
      "mcp:admin-tools" // Block specific MCP server
    ]
  }
}</div>

<h3>Defense in Depth Strategy</h3>
<div class="code-block">Layer 1: CLAUDE.md instructions (suggestions)
    ↓
Layer 2: Tool descriptions (stronger suggestions)  
    ↓
Layer 3: Permission system (enforcement)
    ↓
Layer 4: Hooks — PreToolUse (deterministic gate)
    ↓
Layer 5: Network/OS-level controls (final backstop)</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Each layer catches what the layer above missed. CLAUDE.md says "don't delete production databases." Tool descriptions say "this tool deletes data — use with caution." Permissions block the tool entirely. Hooks validate parameters. OS-level controls prevent the actual system call.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> Security questions follow this pattern: "Which layer is appropriate for X?" The answer depends on the consequence. Higher consequence = deeper layer. Financial compliance = hook. Coding style = CLAUDE.md.</div>
`
        },
        {
          title: "Domain 3 Interactive Quiz",
          type: "quiz",
          questions: [
            {
              q: "A team wants to ensure all engineers follow the same coding standards in Claude Code. Where should these rules go?",
              options: [
                "~/.claude/CLAUDE.md (user level)",
                "./CLAUDE.md at the repo root (project level)",
                "CLAUDE.local.md",
                "In each engineer's system prompt"
              ],
              correct: 1,
              explanation: "Team coding standards belong in the project-level CLAUDE.md at the repo root. It's committed to source control so everyone shares the same rules. User-level is personal; local is gitignored."
            },
            {
              q: "You want Claude Code to review PRs automatically in GitHub Actions. Which command do you use?",
              options: [
                "claude --review",
                "claude -p 'review this PR' --output-format json",
                "claude /review --ci",
                "claude --headless --task review"
              ],
              correct: 1,
              explanation: "claude -p runs Claude Code in non-interactive (headless) mode, suitable for CI/CD. --output-format json gives machine-parseable output for automation."
            },
            {
              q: "Your monorepo has frontend/ and backend/ directories with very different conventions. How do you scope rules?",
              options: [
                "Put everything in the root CLAUDE.md",
                "Use subtree CLAUDE.md files (frontend/CLAUDE.md, backend/CLAUDE.md)",
                "Use CLAUDE.local.md for each",
                "Create separate repos"
              ],
              correct: 1,
              explanation: "Subtree CLAUDE.md files load on-demand when Claude reads files in that directory. frontend/CLAUDE.md only applies when working on frontend files, keeping rules scoped and context efficient."
            },
            {
              q: "A developer wants personal Claude Code settings that aren't shared with the team. Where do they go?",
              options: [
                "Project-level CLAUDE.md",
                "Subtree CLAUDE.md",
                "CLAUDE.local.md (gitignored)",
                "~/.claude/CLAUDE.md only"
              ],
              correct: 2,
              explanation: "CLAUDE.local.md is gitignored — it's for personal repo-specific overrides that shouldn't be committed or shared. User-level ~/.claude/CLAUDE.md works too but applies to ALL projects."
            },
            {
              q: "What does Plan mode (Shift+Tab) do in Claude Code?",
              options: [
                "Generates a project plan document",
                "Claude analyzes and plans but doesn't make file changes",
                "Switches to a planning-specific model",
                "Creates a task list in CLAUDE.md"
              ],
              correct: 1,
              explanation: "Plan mode lets Claude explore, analyze, and propose changes without actually writing to files. It's for understanding before committing — like a read-only exploration mode."
            }
          ]
        }
      ]
    },
    {
      id: 4,
      title: "Prompt Engineering & Structured Output",
      weight: "20%",
      icon: "✍️",
      description: "Context engineering, JSON schemas, extraction patterns, few-shot, forced tool calls, confidence routing.",
      sections: [
        {
          title: "Precise Prompts That Work",
          type: "lesson",
          content: `
<h2>✍️ From Vague to Precise</h2>
<p>The difference between a prompt that "sometimes works" and one that "always works" is specificity. The model picks reasonable defaults — but reasonable isn't YOUR default.</p>

<h3>The Five Rules of Precise Prompts</h3>
<ol>
<li><strong>Specify format</strong> — "Return a JSON object with keys: name, score, reasoning"</li>
<li><strong>Handle edge cases</strong> — "If the field is missing, return null (not empty string)"</li>
<li><strong>Define missing-data behavior</strong> — "If multiple interpretations exist, pick the most conservative"</li>
<li><strong>Set boundaries</strong> — "Maximum 3 sentences per bullet point"</li>
<li><strong>Give acceptance criteria</strong> — "Success means: all required fields present, dates in ISO 8601, amounts in cents"</li>
</ol>

<h3>Bad vs Good Prompts</h3>
<p><strong>❌ "Be accurate"</strong> — This is a wish, not a prompt.</p>
<p><strong>✅ Precise version:</strong></p>
<div class="code-block">Extract invoice data with these rules:
- invoice_number: exact string as printed (preserve hyphens, leading zeros)
- total: numeric value in cents (€12.50 → 1250)
- date: ISO 8601 format (DD/MM/YYYY input → YYYY-MM-DD output)
- If a field is illegible or ambiguous, set it to null and add a note in the 'warnings' array
- If the document is not an invoice, return {"error": "not_an_invoice"}
- Never invent or hallucinate values</div>

<div class="warning-point">⚠️ <strong>Anti-Pattern:</strong> "Please try to be as accurate as possible and format things nicely." This gives the model zero actionable guidance. Replace feelings with checklists.</div>

<h3>System Prompt Structure</h3>
<div class="code-block">system_prompt = """You are an invoice extraction specialist.

## Role
Extract structured data from invoice images and PDFs.

## Rules
1. Extract ONLY what is explicitly stated. Never infer or hallucinate.
2. Preserve source formatting for identifiers (hyphens, leading zeros).
3. Convert all amounts to cents (integer).
4. Convert all dates to ISO 8601.
5. If uncertain about a field, set to null and add a warning.

## Output Format
Call the extract_invoice tool with the extracted data.

## Edge Cases
- Multiple currencies: convert to the invoice's stated currency
- Handwritten amounts: if illegible, null + warning
- Multiple pages: combine into single extraction
"""</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Structure your system prompt with clear sections (Role, Rules, Output Format, Edge Cases). The model attends harder to the top and bottom of context — put the most critical rules first.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> When the exam shows a failing prompt and asks "what's wrong?", look for: missing edge case handling, no format specification, vague instructions like "be helpful", or no missing-data behavior defined.</div>
`
        },
        {
          title: "Few-Shot Examples",
          type: "lesson",
          content: `
<h2>📝 Few-Shot: The Behavior Lock</h2>
<p>Two or three input-output examples beat almost any temperature change. Few-shot pins behavior more reliably than instructions alone.</p>

<h3>When to Use Few-Shot</h3>
<ul>
<li>Corner cases that prose can't describe precisely (decimal commas vs periods)</li>
<li>Regional formatting (DD/MM/YYYY vs MM/DD/YYYY)</li>
<li>Domain-specific jargon or abbreviations</li>
<li>Output structure that's easier to show than explain</li>
</ul>

<h3>Implementation Pattern</h3>
<div class="code-block">messages = [
    # Few-shot example 1: European format
    {
        "role": "user",
        "content": "Extract: Rechnung Nr. 2024-0891, Betrag: 1.234,56€, Datum: 15.03.2024"
    },
    {
        "role": "assistant",
        "content": [{"type": "tool_use", "id": "ex1", "name": "extract_invoice", "input": {
            "invoice_number": "2024-0891",
            "total_cents": 123456,
            "currency": "EUR",
            "date": "2024-03-15",
            "warnings": []
        }}]
    },
    {
        "role": "user",
        "content": [{"type": "tool_result", "tool_use_id": "ex1", "content": "OK"}]
    },
    # Few-shot example 2: Ambiguous case
    {
        "role": "user",
        "content": "Extract: INV-77, Amount: [illegible], Date: 2024-01-??"
    },
    {
        "role": "assistant",
        "content": [{"type": "tool_use", "id": "ex2", "name": "extract_invoice", "input": {
            "invoice_number": "INV-77",
            "total_cents": null,
            "currency": null,
            "date": null,
            "warnings": ["Amount illegible", "Date partially illegible"]
        }}]
    },
    {
        "role": "user",
        "content": [{"type": "tool_result", "tool_use_id": "ex2", "content": "OK"}]
    },
    # Actual request
    {
        "role": "user",
        "content": "Extract: Facture N° 2024/456, Montant: 2.890,00€, Date: 28/02/2024"
    }
]</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Few-shot examples in the message history use the same format as real interactions (user/assistant/tool_result). This is different from putting examples in the system prompt — message history examples are MUCH stronger at locking behavior.</div>

<h3>How Many Examples?</h3>
<ul>
<li><strong>2-3 examples</strong> usually sufficient for format/style locking</li>
<li><strong>5+ examples</strong> for complex extraction with many edge cases</li>
<li><strong>Diminishing returns</strong> after ~8 examples — you're burning context for minimal gain</li>
</ul>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "The model keeps normalizing European dates to US format despite instructions." → Add a few-shot example showing the correct behavior. Few-shot pins corner-case behavior that prose alone cannot reach.</div>
`
        },
        {
          title: "Structured Output Pattern",
          type: "lesson",
          content: `
<h2>📊 The Canonical Structured Output Pattern</h2>
<p>This is the production-grade way to get reliable JSON from Claude. It combines forced tool calls, Pydantic validation, and a retry ceiling.</p>

<h3>The Pattern (5 Steps)</h3>
<ol>
<li>Define a Pydantic model for your desired output</li>
<li>Convert to JSON Schema (Pydantic does this automatically)</li>
<li>Register as a tool's <code>input_schema</code></li>
<li>Set <code>tool_choice: {"type": "tool", "name": "your_tool"}</code></li>
<li>Validate response, retry on failure (with a ceiling)</li>
</ol>

<h3>Full Implementation</h3>
<div class="code-block">from pydantic import BaseModel, Field
from typing import Optional
import json

# Step 1: Pydantic model
class Invoice(BaseModel):
    invoice_number: str = Field(description="Exact invoice ID as printed")
    vendor: str = Field(description="Company name of the vendor")
    total_cents: int = Field(description="Total amount in cents")
    currency: str = Field(description="ISO 4217 currency code")
    date: str = Field(description="Invoice date in ISO 8601 (YYYY-MM-DD)")
    po_number: Optional[str] = Field(None, description="Purchase order number if present")
    warnings: list[str] = Field(default_factory=list, description="Any ambiguities or issues")

# Step 2: JSON Schema (automatic!)
schema = Invoice.model_json_schema()

# Step 3: Register as tool
extract_tool = {
    "name": "extract_invoice",
    "description": "Extract structured invoice data. Call with all fields populated.",
    "input_schema": schema
}

# Step 4: Force the tool call
MAX_RETRIES = 2

def extract_invoice(document_text):
    messages = [{"role": "user", "content": f"Extract invoice data:\\n\\n{document_text}"}]
    
    for attempt in range(MAX_RETRIES + 1):
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            tools=[extract_tool],
            tool_choice={"type": "tool", "name": "extract_invoice"},
            messages=messages
        )
        
        # Get the tool call input
        tool_block = next(b for b in response.content if b.type == "tool_use")
        
        # Step 5: Validate
        try:
            invoice = Invoice(**tool_block.input)
            return invoice  # Success!
        except ValidationError as e:
            if attempt < MAX_RETRIES:
                # Append error and retry
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": [{
                    "type": "tool_result",
                    "tool_use_id": tool_block.id,
                    "content": f"Validation failed: {e}. Fix and try again.",
                    "is_error": True
                }]})
            else:
                raise RuntimeError(f"Failed after {MAX_RETRIES} retries: {e}")</div>

<div class="warning-point">⚠️ <strong>Critical:</strong> Always set a <code>MAX_RETRIES</code> ceiling. Without it, a genuinely bad document will burn 20+ API calls. One retry usually fixes schema issues; two is generous; three is wasteful.</div>

<h3>Confidence Routing</h3>
<p>Add a confidence field to route uncertain extractions to human review:</p>
<div class="code-block">class InvoiceWithConfidence(Invoice):
    confidence: float = Field(
        description="Your confidence in this extraction (0.0 to 1.0). "
        "Set below 0.7 if any field is uncertain or illegible."
    )

CONFIDENCE_THRESHOLD = 0.7

result = extract_invoice(doc)
if result.confidence < CONFIDENCE_THRESHOLD:
    send_to_human_review(result)
else:
    process_automatically(result)</div>

<div class="key-point">💡 <strong>Key Insight:</strong> The confidence field isn't calibrated (the model's 0.8 might be your 0.6), but it's still useful as a routing signal. The bottom slice goes to humans; the top slice is automated. Adjust the threshold empirically.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> This pattern (Pydantic + forced tool call + validation + retry ceiling) is THE answer whenever the exam asks "how do you reliably get structured output from Claude?" It's more reliable than asking in the prompt alone.</div>
`
        },
        {
          title: "Context Engineering",
          type: "lesson",
          content: `
<h2>🧠 Making Context Work For You</h2>
<p>Context engineering is about what goes INTO the model's context window and where. Position, structure, and pruning all matter.</p>

<h3>Attention Patterns</h3>
<p>The model attends most strongly to:</p>
<ul>
<li><strong>System prompt</strong> — always high attention (put critical rules here)</li>
<li><strong>Beginning of conversation</strong> — strong attention</li>
<li><strong>End of conversation</strong> — strong attention (recency)</li>
<li><strong>Middle of long conversations</strong> — weakest attention ("lost in the middle" effect)</li>
</ul>

<h3>Case-Facts Pinning</h3>
<p>Pin unchanging context at the top of the conversation:</p>
<div class="code-block">system_prompt = """You are a support agent for Acme Corp.

## Case Facts (DO NOT MODIFY)
- Customer: Alice Johnson (ID: CUST-12345)
- Plan: Enterprise ($499/mo)
- Account Status: Active since 2023-01-15
- Current Issue: Billing discrepancy on invoice INV-2024-891
- Escalation Path: billing-team@acme.com

## Your Rules
1. Never change or forget the case facts above
2. All refunds require manager approval over $200
3. Always reference the specific invoice number
"""</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Pin case facts at the TOP of the system prompt. The model attends harder to the beginning. Putting critical context in the middle of a long prompt risks it being "lost."</div>

<h3>Tool Output Pruning</h3>
<p>When a tool returns 8KB of JSON and you used 3 fields, strip the rest:</p>
<div class="code-block"># Bad: append raw tool output (wastes tokens)
tool_result = massive_api_response  # 8KB of JSON

# Good: prune to what's needed
tool_result = {
    "customer_name": response["name"],
    "balance": response["account"]["balance"],
    "status": response["account"]["status"]
}
# 95% smaller, all relevant info preserved</div>

<h3>Conversation Summarization</h3>
<p>For long conversations, summarize resolved turns:</p>
<div class="code-block"># Before (3 turns of resolved billing discussion):
messages = [
    {"role": "user", "content": "I was charged twice for March"},
    {"role": "assistant", "content": "Let me look into that..."},
    # ... 5 more messages resolving this
    
    {"role": "user", "content": "Also, my API key isn't working"}
]

# After (summarized):
messages = [
    {"role": "user", "content": "[RESOLVED] Double charge for March — refund processed (REF-123)"},
    {"role": "user", "content": "Also, my API key isn't working"}
]</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "The agent's quality degrades after 20 turns." → Prune verbose tool outputs, summarize resolved turns, keep only active issues in full detail. Token bloat kills quality.</div>
`
        },
        {
          title: "Domain 4 Interactive Quiz",
          type: "quiz",
          questions: [
            {
              q: "The model keeps returning dates in MM/DD/YYYY format despite system prompt instructions to use ISO 8601. What's the most effective fix?",
              options: [
                "Repeat the instruction in all caps",
                "Set temperature to 0",
                "Add few-shot examples showing the correct date format",
                "Add 'IMPORTANT:' before the date rule"
              ],
              correct: 2,
              explanation: "Few-shot examples in the message history lock corner-case behavior more reliably than prose instructions. Two examples showing DD/MM → YYYY-MM-DD conversion will fix this where repeated instructions won't."
            },
            {
              q: "You need guaranteed JSON output matching a specific schema. What's the production pattern?",
              options: [
                "Set response_format: json in the API call",
                "Ask the model to return JSON in the system prompt",
                "Define a tool with the schema and force it with tool_choice: {type: 'tool', name: '...'}",
                "Use regex to validate the text response"
              ],
              correct: 2,
              explanation: "The canonical pattern: Pydantic schema → tool definition → forced tool_choice → validation → retry with ceiling. This guarantees schema-conforming output, unlike prompt-based approaches."
            },
            {
              q: "An extraction pipeline has no retry ceiling. What's the risk?",
              options: [
                "The model might return empty results",
                "A genuinely bad document will burn unlimited API calls indefinitely",
                "The schema might change between retries",
                "Cache invalidation"
              ],
              correct: 1,
              explanation: "Without a max_retries ceiling, a document that truly can't be parsed (illegible, corrupted, not an invoice) will retry forever, burning money and time. Always set a ceiling (usually 1-2 retries)."
            },
            {
              q: "Where in the context window does the model attend most weakly?",
              options: [
                "System prompt",
                "First user message",
                "Middle of long conversations",
                "Last assistant response"
              ],
              correct: 2,
              explanation: "The 'lost in the middle' effect: models attend most strongly to the beginning and end of context, with weakest attention in the middle of long sequences. Pin critical info at the top (system prompt) or bottom (recent messages)."
            },
            {
              q: "A tool returns 8KB of JSON but you only need 3 fields from it. What should you do before appending to context?",
              options: [
                "Compress it with gzip",
                "Strip to only the needed fields before appending",
                "Put it in a separate context window",
                "Cache it for later use"
              ],
              correct: 1,
              explanation: "Prune verbose tool outputs to only the fields you consumed. Extra tokens waste context window space, increase cost, and dilute the model's attention on what actually matters."
            }
          ]
        }
      ]
    },
    {
      id: 5,
      title: "Context Management & Reliability",
      weight: "15%",
      icon: "🛡️",
      description: "Long-context handling, multi-agent handoffs, error propagation, escalation patterns, provenance.",
      sections: [
        {
          title: "Escalation Patterns",
          type: "lesson",
          content: `
<h2>🚨 When to Escalate</h2>
<p>One of the most tested topics: knowing WHEN to hand off to a human and WHAT to pass along.</p>

<h3>The Four Valid Escalation Triggers</h3>
<ol>
<li><strong>Policy</strong> — Refund > threshold, account closure, legal request</li>
<li><strong>Complexity</strong> — Multi-system failure, requires access the agent doesn't have</li>
<li><strong>Risk</strong> — Security concern, compliance issue, data breach</li>
<li><strong>Explicit Request</strong> — "I want to talk to a human NOW"</li>
</ol>

<div class="warning-point">⚠️ <strong>NEVER escalate on sentiment alone.</strong> "I'm frustrated" is not a routing signal. Frustrated customers can still be helped by the agent. Escalating on frustration clogs the human queue with solvable issues.</div>

<h3>Handling Explicit Requests</h3>
<div class="code-block"># When user says "I want a human":
# ✅ DO: Escalate immediately
# ❌ DON'T: "Let me try one more thing first"
# ❌ DON'T: "Can you tell me more about your issue?"
# ❌ DON'T: "I think I can help you with that"

# The customer told you what they want. Honor it.</div>

<h3>Structured Escalation Handoff</h3>
<p>Pass a summary, not the raw transcript. Human agents don't want to read 40 turns:</p>
<div class="code-block">{
    "escalation": {
        "customer": "Alice Johnson (CUST-12345)",
        "plan": "Enterprise",
        "issue": "Billing discrepancy on INV-2024-891, $234.50 charge not matching agreement",
        "attempted_resolution": [
            "Verified charge exists in billing system",
            "Confirmed invoice differs from contract terms",
            "Agent cannot approve adjustment > $200 without manager"
        ],
        "blocked_by": "Requires manager approval for billing adjustment",
        "priority": "medium",
        "customer_sentiment": "professional but firm",
        "recommended_action": "Review contract terms vs. actual charge, approve adjustment if warranted"
    }
}</div>

<div class="key-point">💡 <strong>Key Insight:</strong> The escalation summary is a mini-briefing: WHO, WHAT, WHAT WAS TRIED, WHAT'S BLOCKED. A human agent should be able to pick up without re-asking the customer anything.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> Exam scenarios will present a frustrated customer and ask whether to escalate. The answer is NO if the frustration is the only signal. The answer is YES if there's a policy/complexity/risk trigger OR an explicit request, regardless of tone.</div>
`
        },
        {
          title: "Error Propagation & Recovery",
          type: "lesson",
          content: `
<h2>⚡ Handling Failures Gracefully</h2>
<p>Production agents fail. The question isn't whether — it's how they recover and what information survives the failure.</p>

<h3>Error Categories & Responses</h3>
<div class="code-block">┌─────────────────────────────────────────────────────────┐
│ Error Type     │ Agent Response                          │
├─────────────────────────────────────────────────────────┤
│ Transient      │ Retry with exponential backoff          │
│ (timeout,      │ Max 3 retries, then inform user         │
│  rate limit)   │                                         │
├─────────────────────────────────────────────────────────┤
│ Permanent      │ Inform user, offer alternatives         │
│ (not found,    │ Don't retry (wastes money)              │
│  invalid input)│                                         │
├─────────────────────────────────────────────────────────┤
│ Policy         │ Explain constraint, offer escalation    │
│ (over limit,   │ Don't try to work around it             │
│  unauthorized) │                                         │
├─────────────────────────────────────────────────────────┤
│ Model refused  │ Log, rephrase if appropriate, or        │
│ (stop_reason:  │ escalate to human                       │
│  refusal)      │                                         │
└─────────────────────────────────────────────────────────┘</div>

<h3>Error Propagation in Multi-Agent Systems</h3>
<div class="code-block">def coordinator_with_error_handling(user_request):
    try:
        research = run_subagent("research", research_task)
    except SubagentError as e:
        if e.is_transient:
            # Retry the subagent
            research = run_subagent("research", research_task)
        else:
            # Propagate structured error to coordinator
            return {
                "partial_result": True,
                "completed": ["triage"],
                "failed": ["research"],
                "error": str(e),
                "recommendation": "Proceed with available data or retry later"
            }
    
    # Don't let one subagent failure kill the whole workflow
    try:
        synthesis = run_subagent("synthesis", f"Summarize: {research}")
    except SubagentError:
        # Graceful degradation: return raw research
        return {"result": research, "note": "Synthesis unavailable, raw research returned"}</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Errors should flow UP as structured data, not raw exceptions. Each layer decides: retry, degrade gracefully, or escalate. One failed subagent shouldn't crash the whole coordinator.</div>

<h3>Provenance Preservation</h3>
<p>When an agent makes claims, track where the information came from:</p>
<div class="code-block">{
    "claim": "Your account balance is $1,234.56",
    "source": {
        "tool": "lookup_balance",
        "timestamp": "2024-03-15T10:30:00Z",
        "raw_response_id": "resp_abc123"
    }
}

// vs BAD:
"Your account balance is $1,234.56"
// Where did this number come from? Model hallucination or real data?</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "The synthesis output has no source attributions." → Require subagents to return claim-source mappings. The coordinator preserves them through synthesis. This is a provenance question — the exam loves these.</div>
`
        },
        {
          title: "Long Context & Compaction",
          type: "lesson",
          content: `
<h2>📚 Managing Long Conversations</h2>
<p>Claude's context window is large but not infinite. Long conversations degrade quality. Compaction is the survival strategy.</p>

<h3>Signs of Context Pressure</h3>
<ul>
<li>Model "forgets" instructions from early in the conversation</li>
<li>Responses become less focused, more generic</li>
<li>Model repeats itself or contradicts earlier statements</li>
<li>Token costs spike without proportional value</li>
</ul>

<h3>Compaction Strategies</h3>

<p><strong>1. Aggressive Tool Output Pruning (proactive)</strong></p>
<div class="code-block"># After each tool call, strip to essentials
def prune_tool_output(raw_output, needed_fields):
    """Keep only what downstream turns need."""
    pruned = {k: raw_output[k] for k in needed_fields if k in raw_output}
    return json.dumps(pruned)  # 95% smaller</div>

<p><strong>2. Turn Summarization (proactive)</strong></p>
<div class="code-block"># Replace resolved sub-conversations with summaries
def summarize_resolved_turns(messages):
    """Collapse resolved issue threads into one-liners."""
    # Keep: active issues in full detail
    # Replace: resolved issues with "[RESOLVED] summary"
    # Keep: last 3-5 turns always in full</div>

<p><strong>3. Context Compaction (reactive)</strong></p>
<div class="code-block"># When window pressure hits, do structured summarization
compaction_prompt = """Summarize this conversation preserving:
1. All case facts (customer ID, issue, plan) VERBATIM
2. All unresolved actions and their current state
3. Key decisions made and their reasoning
4. Discard: resolved issues, redundant tool outputs, pleasantries"""</div>

<h3>Multi-Agent Context Management</h3>
<div class="code-block"># Each subagent starts fresh (no history bloat)
# Only RESULTS flow between agents, not full conversations

coordinator_context = [
    system_prompt,          # Always present
    case_facts,            # Pinned at top
    subagent_1_result,     # Summary only
    subagent_2_result,     # Summary only
    current_user_message   # What we're working on now
]
# Clean, focused, no cruft from subagent internals</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Compaction is a FALLBACK, not a strategy. Good context management means you rarely need it: prune tool outputs, summarize resolved turns, and scope subagent context from the start.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "Agent quality degrades over long sessions." The exam answer hierarchy: 1) Prune tool outputs, 2) Summarize resolved turns, 3) Compact as last resort. Never "just increase max_tokens" — that treats the symptom.</div>
`
        },
        {
          title: "Production Reliability Patterns",
          type: "lesson",
          content: `
<h2>🏭 Building Agents That Don't Break</h2>
<p>Production reliability comes from observability, graceful degradation, and correct error handling at every layer.</p>

<h3>Observability: What to Log</h3>
<div class="code-block"># Log the three critical streams:
# 1. Every stop_reason
logger.info(f"stop_reason={response.stop_reason}")

# 2. Every tool call + result
logger.info(f"tool_call: {tool_name}({tool_input})")
logger.info(f"tool_result: {result[:200]}")  # Truncate for logs

# 3. Every hook decision
logger.info(f"hook: {hook_name} -> {'blocked' if blocked else 'allowed'}")

# Build a dashboard on these three streams BEFORE you ship</div>

<h3>Graceful Degradation</h3>
<div class="code-block"># Pattern: Try best → fallback → manual
def process_request(request):
    try:
        # Try: Full agent with all tools
        return full_agent(request)
    except ModelOverloadError:
        # Fallback: Simpler model, fewer tools
        return simple_agent(request, model="claude-haiku-4-5-20251016")
    except AllModelsUnavailable:
        # Manual: Queue for human
        return queue_for_human(request, reason="all models unavailable")</div>

<h3>Rate Limiting & Backpressure</h3>
<div class="code-block">import time
from functools import wraps

def with_retry(max_retries=3, base_delay=1.0):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except RateLimitError:
                    delay = base_delay * (2 ** attempt)  # Exponential backoff
                    time.sleep(delay)
                except OverloadError:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(base_delay * 5)  # Longer wait for overload
            raise MaxRetriesExceeded()
        return wrapper
    return decorator

@with_retry(max_retries=3)
def call_claude(messages):
    return client.messages.create(...)</div>

<h3>The Production Checklist</h3>
<ul>
<li>✅ Every tool call has a timeout</li>
<li>✅ Every retry loop has a ceiling</li>
<li>✅ Every hook fails closed</li>
<li>✅ Every error returns structured data</li>
<li>✅ Every escalation passes a summary</li>
<li>✅ Logs capture stop_reason, tool calls, and hook decisions</li>
<li>✅ Fallback models configured for degraded operation</li>
<li>✅ Token usage tracked and alerted</li>
</ul>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "How do you monitor an agent in production?" → Log every stop_reason, every tool call, every hook decision. Build a dashboard on those three streams. The exam wants observability at the loop level, not generic "add monitoring."</div>
`
        },
        {
          title: "Domain 5 Interactive Quiz",
          type: "quiz",
          questions: [
            {
              q: "A customer says 'I'm really frustrated with this service.' Should the agent escalate to a human?",
              options: [
                "Yes — frustrated customers should always go to humans",
                "No — frustration alone is not an escalation trigger. Continue helping.",
                "Yes — sentiment indicates the agent has failed",
                "No — but lower the response tone to match"
              ],
              correct: 1,
              explanation: "Never escalate on sentiment alone. Frustration is not complexity. Valid triggers are: policy breach, complexity beyond agent capability, risk (security/compliance), or explicit 'I want a human' request."
            },
            {
              q: "A subagent fails with a transient error (timeout). What should the coordinator do?",
              options: [
                "Immediately escalate to human",
                "Retry the subagent, then degrade gracefully if retry fails",
                "Continue without that subagent's output",
                "Return the raw error to the user"
              ],
              correct: 1,
              explanation: "Transient errors (timeout, rate limit) should be retried. If retry fails, degrade gracefully (return partial results, use cached data, or explain the limitation). Don't crash the whole workflow for one flaky call."
            },
            {
              q: "The synthesis output from a multi-agent system has no source attributions. What's the architectural fix?",
              options: [
                "Add 'cite your sources' to the synthesis prompt",
                "Require subagents to return claim-source mappings; coordinator preserves them",
                "Post-process the output to add citations",
                "Use a separate citation agent"
              ],
              correct: 1,
              explanation: "Provenance must be structural, not prompt-based. Subagents should return data with source metadata, and the coordinator must preserve these mappings through synthesis. You can't reliably add citations after the fact."
            },
            {
              q: "Your agent's response quality is degrading after 20+ turns. What's the FIRST thing to try?",
              options: [
                "Increase max_tokens",
                "Switch to a larger model",
                "Prune verbose tool outputs and summarize resolved turns",
                "Restart the conversation"
              ],
              correct: 2,
              explanation: "Context bloat is the likely cause. First: prune tool outputs (keep only used fields). Second: summarize resolved turns. These are proactive fixes. Compaction (full context summary) is the last resort. 'Increase max_tokens' treats the symptom."
            },
            {
              q: "A user says 'I want to talk to a human RIGHT NOW.' What should the agent do?",
              options: [
                "Try one more tool call to resolve the issue first",
                "Ask 'Can you tell me more about your issue so I can help?'",
                "Escalate immediately with a structured summary",
                "Check if the issue is actually complex enough to warrant escalation"
              ],
              correct: 2,
              explanation: "Honor explicit requests for human immediately. Don't try one more thing. Don't ask for clarification. The customer told you what they want. Pass a structured summary to the human agent and hand off."
            }
          ]
        }
      ]
    }
  ],
  // Mock Tests
  mockTests: [
    {
      id: "mock1",
      title: "Mock Test 1: Domain Focus - Agentic Architecture",
      description: "15 questions focused on Domain 1 (27% weight)",
      timeLimit: 30,
      passingScore: 720,
      questions: [
        {
          q: "An e-commerce agent receives stop_reason='pause_turn' from the Agent SDK. What does this indicate?",
          options: ["The model hit max_tokens", "The agent yielded control but isn't done — resume or fork", "The model refused the request", "A tool timed out"],
          correct: 1,
          explanation: "pause_turn is an Agent SDK-specific stop_reason indicating the model yielded control voluntarily. You can resume (continue the same conversation) or fork (branch to explore alternatives)."
        },
        {
          q: "A healthcare agent must never reveal patient data to unauthorized users. Where should this rule be enforced?",
          options: ["System prompt only", "Tool descriptions", "PreToolUse hook + PostToolUse audit hook", "Temperature setting"],
          correct: 2,
          explanation: "HIPAA-level compliance requirements must be in code. PreToolUse hook checks authorization before data access; PostToolUse audits what was returned. Prompts are suggestions; hooks are guarantees."
        },
        {
          q: "You're designing a CI triage agent. It needs to: 1) fetch build logs, 2) identify failure patterns, 3) suggest fixes. What's the best architecture?",
          options: ["Single agent with all three capabilities", "Three separate agents with no coordinator", "Coordinator + research subagent (logs) + analysis subagent (patterns + fixes)", "Pipeline: Agent A → Agent B → Agent C with no coordinator"],
          correct: 2,
          explanation: "Hub-and-spoke: coordinator dispatches to scoped subagents. Research subagent reads logs (read-only tools), analysis subagent identifies patterns and suggests fixes. Coordinator synthesizes. This gives tool scoping and context isolation."
        },
        {
          q: "What is the FIRST thing wrong with this loop? while response.content[-1].text != 'DONE': continue_loop()",
          options: ["Missing error handling", "Parsing text content to detect completion instead of branching on stop_reason", "The index might be out of bounds", "Should use response.stop_reason == 'stop_sequence'"],
          correct: 1,
          explanation: "The cardinal sin: parsing natural language to detect completion. Always branch on stop_reason. The model might say 'DONE' mid-sentence, or never say it. stop_reason is the authoritative signal."
        },
        {
          q: "In the Agent SDK, what does settingSources: ['user', 'project'] do?",
          options: ["Loads API keys from two locations", "Loads CLAUDE.md from user-level and project-level", "Sets up two different models", "Configures logging sources"],
          correct: 1,
          explanation: "settingSources tells the Agent SDK to load instructions from both ~/.claude/CLAUDE.md (user defaults) and ./CLAUDE.md (project conventions). Both apply, with project overriding user on conflicts."
        },
        {
          q: "A coordinator passes the FULL conversation history of Subagent A to Subagent B. What's the problem?",
          options: ["Nothing — this is best practice", "Context contamination — B sees A's internal reasoning and tool calls", "B will refuse to process A's messages", "It's too expensive"],
          correct: 1,
          explanation: "Context isolation is critical. Subagent B should only see A's FINAL OUTPUT, not its internal reasoning or tool calls. Passing full history causes cross-contamination, bloated context, and confused behavior."
        },
        {
          q: "Your agent has 15 tools. Most requests only need 2-3. How do you improve performance?",
          options: ["Remove tools the model rarely uses", "Use a triage step: first determine which tool category, then provide only relevant tools", "Always provide all tools — the model handles selection", "Set tool_choice to 'any' for faster selection"],
          correct: 1,
          explanation: "A two-stage approach: lightweight triage determines the category (billing? technical? account?), then only relevant tools are provided. This reduces confusion, speeds selection, and cuts token costs from sending all tool definitions."
        },
        {
          q: "When should you use session 'fork' instead of session 'resume'?",
          options: ["When the user returns after a break", "When you want parallel exploration of different approaches from a shared history point", "When the conversation is too long", "When switching models"],
          correct: 1,
          explanation: "Fork creates a new independent conversation branching from a specific point in history. Use it for parallel exploration (try approach A in one fork, approach B in another). Resume continues the same linear conversation."
        },
        {
          q: "An agent processes a refund for $750 despite a $500 limit in the system prompt. The system prompt clearly says 'max refund $500'. What went wrong?",
          options: ["The system prompt wasn't clear enough", "System prompts are suggestions — the model can override. Policy should be enforced in a hook.", "The model had a bug", "Temperature was too high"],
          correct: 1,
          explanation: "System prompts are guidance, not enforcement. An adversarial or confusing user message can cause the model to override prompt instructions. Financial limits must be enforced in application code (PreToolUse hook) for a deterministic guarantee."
        },
        {
          q: "What's the correct order of the agentic loop cycle?",
          options: ["Send request → execute tools → inspect stop_reason → append results", "Send request → inspect stop_reason → execute tools if requested → append results → repeat", "Execute tools → send request → get response → check content", "Get response → parse text → decide action → execute"],
          correct: 1,
          explanation: "The canonical cycle: 1) Send messages.create, 2) Inspect stop_reason, 3) If tool_use: execute tools and append tool_results, 4) Repeat. stop_reason inspection is step 2, before any tool execution."
        },
        {
          q: "A PreToolUse hook returns {allowed: true} but the tool itself throws an error. Who handles the error?",
          options: ["The hook retries", "The tool execution layer catches it and returns a structured error to the model", "The coordinator restarts the subagent", "The error is silently dropped"],
          correct: 1,
          explanation: "Hooks gate ACCESS (should this call happen?). Tool execution handles RESULTS (what happened?). If the hook allows and the tool fails, the execution layer returns a structured error (isError, errorCategory, isRetryable) so the model can decide next steps."
        },
        {
          q: "You need to add human-in-the-loop approval for high-risk actions. Where in the architecture does this go?",
          options: ["System prompt instruction to ask for confirmation", "PreToolUse hook that pauses for human approval on flagged actions", "PostToolUse hook that reverses unapproved actions", "A separate approval agent"],
          correct: 1,
          explanation: "PreToolUse hook is the right place: intercept BEFORE execution, pause for human approval on high-risk actions (identified by tool name + parameter values), then allow or block based on the decision."
        },
        {
          q: "What distinguishes the Agent SDK from the raw Messages API?",
          options: ["Agent SDK uses a different model", "Agent SDK manages the loop, hooks, and settings loading; Messages API requires you to manage everything manually", "Agent SDK is cheaper", "Messages API can't do tool calls"],
          correct: 1,
          explanation: "The Agent SDK is convenience built on top of the Messages API. It manages the agentic loop, hook lifecycle, CLAUDE.md loading, and multi-agent coordination. The Messages API is the raw primitive where you control everything yourself."
        },
        {
          q: "Your agent needs to: check inventory, calculate shipping, and process payment — in that exact order. How do you ensure sequential execution?",
          options: ["Trust the model to figure out the order", "Use tool_choice to force each tool in sequence across turns", "Set disable_parallel_tool_use: true and describe dependencies in tool descriptions", "Create three separate agents"],
          correct: 2,
          explanation: "disable_parallel_tool_use: true prevents the model from calling multiple tools simultaneously. Combined with clear descriptions of dependencies ('call AFTER inventory check confirms availability'), this ensures sequential execution."
        },
        {
          q: "A customer support agent has been running fine for months. Suddenly it starts recommending competitors. Most likely cause?",
          options: ["Model update changed behavior", "Context window filled with competitor mentions from tool results that weren't pruned", "System prompt was modified", "Hooks were disabled"],
          correct: 1,
          explanation: "Context contamination: if tool results (web searches, knowledge base) return competitor content and it's not pruned, it accumulates in context and influences the model's responses. Prune tool outputs to relevant fields only."
        }
      ]
    },
    {
      id: "mock2",
      title: "Mock Test 2: Domain Focus - Tools & MCP + Claude Code",
      description: "15 questions on Domains 2 & 3 (38% combined weight)",
      timeLimit: 30,
      passingScore: 720,
      questions: [
        {
          q: "Your MCP server needs to connect to a remote API using an auth token. Which transport and config is correct?",
          options: ["stdio with token in args", "SSE or HTTP with token in headers via ${ENV_VAR}", "stdio with token hardcoded in .mcp.json", "HTTP with token in the URL query string"],
          correct: 1,
          explanation: "Remote APIs use SSE or HTTP transport. Auth tokens go in headers using ${ENV_VAR} expansion. Never hardcode secrets in config files; never put tokens in URLs (they end up in logs)."
        },
        {
          q: "A tool description says 'Searches stuff'. What's wrong?",
          options: ["Nothing — short descriptions are better", "It doesn't specify what to search, when to use it, when NOT to use it, or what the output looks like", "Should use all caps", "Needs more technical jargon"],
          correct: 1,
          explanation: "Good descriptions answer: What does it do? When should it be called? When should it NOT be called? What do inputs mean? What does success/failure look like? 'Searches stuff' answers none of these."
        },
        {
          q: "You want Claude to ALWAYS call a tool (for structured output) but you don't care which tool. What do you set?",
          options: ["tool_choice: {type: 'auto'}", "tool_choice: {type: 'tool', name: 'any_tool'}", "tool_choice: {type: 'any'}", "tool_choice: {type: 'none'}"],
          correct: 2,
          explanation: "type: 'any' means the model MUST call some tool but can choose which one. Use this for classification or routing where any tool is acceptable but text-only responses aren't."
        },
        {
          q: "Your .mcp.json has ${GITHUB_TOKEN} but the env var isn't set. What happens?",
          options: ["Server uses empty string", "Server fails to start with a readable error", "Claude Code ignores the server", "The literal string '${GITHUB_TOKEN}' is used"],
          correct: 1,
          explanation: "When a referenced env var is unset, the MCP server fails to start. This is intentional — it prevents running with missing credentials. Set the var, restart the server."
        },
        {
          q: "Which CLAUDE.md file should contain 'Use TypeScript strict mode' for a team project?",
          options: ["~/.claude/CLAUDE.md", "./CLAUDE.md (project root)", "CLAUDE.local.md", "frontend/CLAUDE.md"],
          correct: 1,
          explanation: "Team conventions (like TypeScript strict mode) go in the project-level CLAUDE.md at the repo root. It's committed to git so everyone shares the same rules."
        },
        {
          q: "You're caching tool definitions. Where does cache_control go?",
          options: ["On every tool", "On the first tool only", "On the LAST tool in the list", "In the system prompt"],
          correct: 2,
          explanation: "Put cache_control: {type: 'ephemeral'} on the LAST tool. Anthropic caches everything up to and including the marker. Everything before it gets cached together."
        },
        {
          q: "An agent runs claude -p in CI but the command hangs. Most likely cause?",
          options: ["Missing --output-format flag", "claude -p is interactive mode", "ANTHROPIC_API_KEY not set in CI environment", "Needs --ci flag"],
          correct: 2,
          explanation: "claude -p is non-interactive/headless mode. If it hangs, the API key is likely not set (waiting for auth), or the network can't reach the API. Always ensure ANTHROPIC_API_KEY is in the CI environment."
        },
        {
          q: "What are the three MCP server primitives?",
          options: ["Read, Write, Execute", "Tools, Resources, Prompts", "Input, Output, Error", "Request, Response, Stream"],
          correct: 1,
          explanation: "MCP servers expose three primitives: Tools (functions to call), Resources (data to read), and Prompts (pre-built prompt templates). Each serves a different purpose in the model's interaction with external systems."
        },
        {
          q: "You need to add a custom slash command to Claude Code. Where does the file go?",
          options: [".claude/commands/name.md", "CLAUDE.md", ".mcp.json", ".claude/rules/name.md"],
          correct: 0,
          explanation: "Custom slash commands (Agent Skills) go in .claude/commands/. Each .md file becomes a slash command. .claude/rules/ is for path-specific rules with glob patterns."
        },
        {
          q: "cache_read_input_tokens is 0 on your second API call. What went wrong?",
          options: ["Cache expired (TTL passed)", "cache_control wasn't set correctly, or content changed between calls", "The model doesn't support caching", "You need to wait longer between calls"],
          correct: 1,
          explanation: "If cache_read is 0 on call 2, either: cache_control wasn't on the right block, the cached content changed between calls (invalidating the cache), or more than ~5 min passed (ephemeral TTL expired)."
        },
        {
          q: "A tool returns an error as a plain string: 'Something went wrong'. What should it return instead?",
          options: ["An HTTP status code", "A structured object: {isError: true, errorCategory, isRetryable, message}", "Nothing — let the model figure it out", "A stack trace"],
          correct: 1,
          explanation: "Structured errors give the model clear signals: is this retryable? Is it a policy block or a transient failure? Should it try a different approach? Plain strings force guessing."
        },
        {
          q: "What does disable_parallel_tool_use: true do?",
          options: ["Prevents the model from using tools entirely", "Forces the model to call tools one at a time, sequentially", "Disables tool caching", "Limits to one tool per conversation"],
          correct: 1,
          explanation: "It prevents the model from requesting multiple tool calls in a single response. Tools execute one at a time. Use when ordering matters or when Tool B depends on Tool A's output."
        },
        {
          q: "Your FastMCP server has @mcp.tool(), @mcp.resource(), and @mcp.prompt() decorators. It runs with mcp.run(transport='stdio'). What's the transport for Claude Code to connect?",
          options: ["HTTP with localhost URL", "SSE with WebSocket", "stdio — command + args in .mcp.json", "gRPC"],
          correct: 2,
          explanation: "transport='stdio' means the server communicates via stdin/stdout. In .mcp.json, you configure it with 'command' and 'args' that launch the process. No network needed — it's a local subprocess."
        },
        {
          q: "Plan mode in Claude Code (Shift+Tab) does what?",
          options: ["Generates a project plan file", "Makes Claude analyze and plan without writing files", "Plans the next sprint", "Opens a planning template"],
          correct: 1,
          explanation: "Plan mode is read-only exploration. Claude can analyze code, reason about approaches, and explain options without actually modifying files. Use it to understand before committing to changes."
        },
        {
          q: "You have path-specific rules: 'All React components must use aria-labels'. Where does this go?",
          options: ["Root CLAUDE.md", ".claude/rules/frontend.md with paths: ['**/*.tsx']", "CLAUDE.local.md", "In each component file as a comment"],
          correct: 1,
          explanation: ".claude/rules/ with a paths glob ensures the rule only applies when working on matching files. This keeps the rule scoped to TSX/React files without polluting backend or other contexts."
        }
      ]
    },
    {
      id: "mock3",
      title: "Mock Test 3: Domain Focus - Prompts & Context",
      description: "15 questions on Domains 4 & 5 (35% combined weight)",
      timeLimit: 30,
      passingScore: 720,
      questions: [
        {
          q: "Your extraction prompt says 'Be accurate and return good JSON'. What's the main problem?",
          options: ["It's too short", "It gives no actionable guidance — no format spec, no edge cases, no missing-data behavior", "It should mention the model name", "JSON isn't a supported format"],
          correct: 1,
          explanation: "'Be accurate' is a wish, not a prompt. Replace with: specific field names, data types, what to do with missing values, how to handle ambiguity, and explicit format requirements."
        },
        {
          q: "You're using the forced tool call pattern. Validation fails on the first attempt. What's the correct retry approach?",
          options: ["Start over with a new conversation", "Append the validation error as a tool_result and retry (with max_retries ceiling)", "Lower the temperature and try again", "Switch to a different model"],
          correct: 1,
          explanation: "Append the ValidationError back as a tool_result (with is_error: true). The model sees what went wrong and can fix it. Always set a max_retries ceiling (1-2) to avoid infinite loops on genuinely bad input."
        },
        {
          q: "A customer says 'This is ridiculous. I've been waiting 20 minutes!' Should the agent escalate?",
          options: ["Yes — customer is angry", "No — frustration alone isn't an escalation trigger. Continue resolving the issue.", "Yes — long wait implies system failure", "Ask the customer if they want escalation"],
          correct: 1,
          explanation: "Frustration is not an escalation trigger. The valid triggers are: policy breach, complexity beyond capability, security/compliance risk, or explicit 'I want a human' request. An angry customer with a solvable problem should still be helped."
        },
        {
          q: "You add a 'confidence: float' field to your extraction schema. The model returns 0.85. Can you trust this is calibrated?",
          options: ["Yes — Claude is well-calibrated", "No — it's not calibrated but still useful as a routing signal for human review", "Only if temperature is 0", "Only with few-shot calibration examples"],
          correct: 1,
          explanation: "Model-reported confidence isn't calibrated (their 0.8 might be your 0.6). But it's still useful as a ROUTING signal: high-confidence → auto-process, low-confidence → human review. Adjust the threshold empirically."
        },
        {
          q: "Where does the model attend MOST strongly in a long context?",
          options: ["Evenly across all content", "Beginning (system prompt) and end (recent messages)", "Only the last 3 messages", "Only the system prompt"],
          correct: 1,
          explanation: "The 'lost in the middle' effect: attention is strongest at the beginning (system prompt, first messages) and end (recent context). Middle of long conversations gets weakest attention. Pin critical info at top or bottom."
        },
        {
          q: "A tool returns 12KB of customer data. You only need name, email, and status. What should you do?",
          options: ["Append the full 12KB to maintain completeness", "Strip to only the 3 needed fields before appending to conversation", "Summarize it in natural language", "Store it externally and reference by ID"],
          correct: 1,
          explanation: "Prune tool outputs to only consumed fields. 12KB of unused JSON wastes tokens, bloats context, dilutes attention, and increases cost — all with zero benefit."
        },
        {
          q: "How many few-shot examples are typically needed to lock formatting behavior?",
          options: ["10+ for reliability", "2-3 is usually sufficient", "Just 1 is enough", "Few-shot doesn't help with formatting"],
          correct: 1,
          explanation: "2-3 examples typically pin format/style behavior. 5+ for complex extraction with many edge cases. Diminishing returns after ~8 examples. More examples = less remaining context for actual work."
        },
        {
          q: "An agent's synthesis output claims 'the account was created in 2019' but no tool result confirms this. What's the architectural problem?",
          options: ["The model hallucinated", "No provenance tracking — claims aren't linked to source data", "The knowledge cutoff is wrong", "Tool caching returned stale data"],
          correct: 1,
          explanation: "This is a provenance failure. The architecture should require claim-source mappings: every factual claim must reference which tool call produced it. Without provenance, you can't distinguish real data from hallucination."
        },
        {
          q: "Your extraction pipeline has max_retries = 0 (no retries). A minor schema mismatch causes failure. What should you change?",
          options: ["Set max_retries = 1 or 2 to allow the model to self-correct", "Loosen the schema", "Remove validation entirely", "Use a different model"],
          correct: 0,
          explanation: "One retry usually fixes minor schema issues (wrong type, missing field the model can infer). Two retries is generous. Zero retries means any fixable error becomes a hard failure unnecessarily."
        },
        {
          q: "You're building a multi-agent system. Agent A researches, Agent B synthesizes. How should provenance flow?",
          options: ["Agent B should cite Agent A by name", "Agent A returns claim-source mappings; coordinator preserves them through to Agent B's synthesis", "Add a third agent that handles citations", "Let the user verify sources manually"],
          correct: 1,
          explanation: "Structural provenance: Agent A returns {claim, source_tool, timestamp} pairs. The coordinator preserves these through to synthesis. Agent B incorporates source metadata into its output. Provenance is an architectural decision, not a prompt instruction."
        },
        {
          q: "Which approach gives the STRONGEST guarantee of JSON schema compliance?",
          options: ["Saying 'return valid JSON' in the prompt", "Setting temperature to 0", "Forced tool call + Pydantic validation + retry ceiling", "Using response_format: json"],
          correct: 2,
          explanation: "The canonical production pattern: define schema as tool input_schema, force with tool_choice, validate with Pydantic, retry on failure (with ceiling). Each layer reinforces the others. Prompt-only approaches have no enforcement."
        },
        {
          q: "Context compaction should be used as a:",
          options: ["Primary strategy from the start", "Last resort when proactive measures (pruning, summarization) aren't enough", "Replacement for tool output pruning", "First response to quality degradation"],
          correct: 1,
          explanation: "Compaction is a FALLBACK, not a strategy. Good context management means: prune tool outputs proactively, summarize resolved turns, scope subagent context. Only compact when window pressure hits despite these measures."
        },
        {
          q: "A user escalation handoff passes the raw 40-turn transcript to the human agent. What's wrong?",
          options: ["Nothing — complete information is best", "Humans don't want to read 40 turns. Pass a structured summary: who, what, tried, blocked.", "The transcript might contain PII", "It's too expensive to store"],
          correct: 1,
          explanation: "Pass a structured escalation summary: customer identity, issue summary, what was attempted, what's blocked, recommended action. Human agents should pick up without re-asking the customer anything already covered."
        },
        {
          q: "System prompt has 5 rules. Rule 3 (in the middle) is most important. Where should you put it?",
          options: ["Keep it at position 3 — ordering doesn't matter", "Move to position 1 — the model attends more strongly to items at the beginning", "Move to the end", "Repeat it 3 times"],
          correct: 1,
          explanation: "Attention is strongest at the beginning and end of sequences. Your most critical rules should be first (or clearly called out with formatting). Middle items risk weaker attention, especially in long prompts."
        },
        {
          q: "What's the correct way to pin case-specific facts for efficient repeated use across API calls?",
          options: ["Put them in every user message", "Put them in the system prompt with cache_control: {type: 'ephemeral'}", "Store them in a database", "Put them in tool descriptions"],
          correct: 1,
          explanation: "Case facts in the system prompt + cache_control means they're sent once (cache write), then reused cheaply on subsequent calls (cache read, ~90% cheaper). Verify with cache_read_input_tokens > 0 on call 2."
        }
      ]
    },
    {
      id: "mock4",
      title: "Mock Test 4: Mixed Domains - Scenario Based",
      description: "15 scenario-based questions across all domains",
      timeLimit: 30,
      passingScore: 720,
      questions: [
        {
          q: "SCENARIO: A bank builds a Claude agent for loan applications. It must: verify income, check credit score, calculate eligibility, and issue decisions. A regulatory audit requires deterministic decision trails. Which architecture?",
          options: ["Single agent with all tools and detailed logging", "Coordinator + verification subagent + decision subagent, with PreToolUse hooks for compliance gates and PostToolUse hooks for audit logging", "Three agents with shared context", "Pipeline with no coordinator"],
          correct: 1,
          explanation: "Regulatory requirements demand: scoped tools (verification ≠ decision), deterministic gates (hooks prevent unauthorized decisions), and audit trails (PostToolUse logging). Coordinator orchestrates; subagents have scoped access; hooks provide compliance guarantees."
        },
        {
          q: "SCENARIO: An agent's invoice extractor works on US invoices but fails on German ones (1.234,56€ vs $1,234.56). The system prompt says 'handle all formats'. How to fix?",
          options: ["Add more detail to the system prompt about European formats", "Add 2-3 few-shot examples showing European invoice extraction with correct decimal handling", "Change the model to one trained on European data", "Post-process the output with regex"],
          correct: 1,
          explanation: "Format-specific behavior (decimal commas, DD.MM.YYYY) is a corner case that prose instructions can't reliably pin. Few-shot examples showing correct European format handling lock the behavior much more effectively."
        },
        {
          q: "SCENARIO: Your agent runs 50+ turns with a customer. Response quality starts dropping — it forgets earlier context and repeats itself. Root cause and fix?",
          options: ["Model bug — switch models", "Context bloat — prune tool outputs, summarize resolved turns, consider compaction", "Token limit hit — increase max_tokens", "Temperature drift — reset to 0"],
          correct: 1,
          explanation: "Long conversation quality degradation = context bloat. Fix: 1) Prune tool outputs to consumed fields, 2) Summarize resolved sub-issues into one-liners, 3) If still pressured, compact the full context. Don't just throw more tokens at it."
        },
        {
          q: "SCENARIO: A development team has 3 microservices in a monorepo. Each has different coding standards. Claude Code keeps applying backend patterns to frontend code. Fix?",
          options: ["More detailed root CLAUDE.md", "Subtree CLAUDE.md files: backend/CLAUDE.md, frontend/CLAUDE.md, infra/CLAUDE.md", "Separate repos", "Use .claude/rules with path globs for each service"],
          correct: 3,
          explanation: "While subtree CLAUDE.md works, .claude/rules/ with path globs is the most precise: each rule file specifies exactly which file patterns it applies to. This prevents any cross-contamination between service conventions."
        },
        {
          q: "SCENARIO: An MCP server works locally but fails in staging. The error is 'Bearer token undefined'. The .mcp.json uses ${API_TOKEN}. What's wrong?",
          options: ["Token expired", "The API_TOKEN environment variable isn't set in the staging environment", "SSE transport doesn't support auth", "The URL is wrong"],
          correct: 1,
          explanation: "${ENV_VAR} expansion requires the variable to actually be set in the runtime environment. If it works locally (where you have API_TOKEN set) but fails in staging, staging is missing the env var."
        },
        {
          q: "SCENARIO: A customer says 'I'm done trying to explain this. Give me a supervisor.' The agent's issue is actually simple and almost resolved. What should the agent do?",
          options: ["Finish resolving the issue since it's almost done", "Explain that the issue is simple and offer to resolve it quickly", "Escalate immediately with a structured summary — customer explicitly requested human", "Ask one more clarifying question"],
          correct: 2,
          explanation: "Explicit request for human = immediate escalation. It doesn't matter that the issue is simple or almost resolved. The customer said what they want. Honor it. Pass a summary so the human agent can resolve quickly."
        },
        {
          q: "SCENARIO: You're caching both the system prompt (2KB vendor policy) and tool definitions (5 tools). How do you set up caching efficiently?",
          options: ["cache_control on every message", "cache_control on the system prompt block AND on the last tool definition", "cache_control only on the system prompt", "Caching is automatic — no setup needed"],
          correct: 1,
          explanation: "Two cache breakpoints: one on the system prompt block (caches the 2KB policy), one on the last tool (caches all tool definitions). Each gets its own cache entry. Verify hits with cache_read_input_tokens."
        },
        {
          q: "SCENARIO: A multi-agent research system returns claims without sources. The coordinator just concatenates subagent outputs. Architectural fix?",
          options: ["Add 'cite sources' to coordinator's prompt", "Redesign: subagents return {claim, source, timestamp} tuples; coordinator preserves provenance through synthesis", "Add a fact-checking agent at the end", "Log all API calls"],
          correct: 1,
          explanation: "Provenance is structural. Subagents must return claim-source mappings as part of their output format. The coordinator preserves these through synthesis. You can't reliably add citations after the fact."
        },
        {
          q: "SCENARIO: Your agent uses tool_choice: 'auto' and sometimes the model returns text instead of calling a tool when it should. What's happening?",
          options: ["Model bug", "With 'auto', the model can choose text-only responses. Use 'any' or 'tool' to force tool calls.", "Temperature too high", "Tools aren't defined correctly"],
          correct: 1,
          explanation: "tool_choice: 'auto' means the model MAY use tools but can also respond with just text. If you need guaranteed tool usage, use 'any' (must call some tool) or 'tool' + name (must call specific tool)."
        },
        {
          q: "SCENARIO: An agent processes a security-sensitive action. The PreToolUse hook crashes with an unhandled exception. What should happen?",
          options: ["Skip the hook and proceed with the tool call", "Block the tool call (fail closed) and log the hook failure", "Retry the hook indefinitely", "Return success to the model"],
          correct: 1,
          explanation: "Security-sensitive hooks must FAIL CLOSED. If you can't verify the policy (hook crashed), you must not proceed. Block the action, log the failure loudly, and alert ops. Never fail open on security."
        },
        {
          q: "SCENARIO: You want Claude Code to auto-format code on save in CI. Which approach?",
          options: ["CLAUDE.md instruction 'always format code'", "A PostToolUse hook on file writes that runs a formatter", "claude -p 'format all files' in the CI pipeline", "Hook on fileEdited event that runs the linter"],
          correct: 2,
          explanation: "claude -p (headless mode) in CI is the right pattern for automated tasks. It's non-interactive, scriptable, and returns structured output. Hooks are for Claude Code interactive sessions, not CI pipelines."
        },
        {
          q: "SCENARIO: Rate limiting kicks in during a critical customer conversation. How should the agent handle it?",
          options: ["Return an error to the customer immediately", "Retry with exponential backoff (max 3 attempts), then degrade gracefully to a simpler response or queue for human", "Switch to a different API provider", "Wait indefinitely for the rate limit to clear"],
          correct: 1,
          explanation: "Rate limits are transient. Retry with exponential backoff (2^n seconds). After max retries, degrade gracefully (simpler model, cached response, or queue for human). Never expose raw infrastructure errors to customers."
        },
        {
          q: "SCENARIO: A coordinator agent needs to pick between 6 subagents based on the user's request. How to make selection reliable?",
          options: ["Long if/else chain in code", "Give the coordinator a 'classify_intent' tool with enum options matching subagent names, forced with tool_choice", "Let the coordinator pick freely with no constraints", "Use keyword matching"],
          correct: 1,
          explanation: "Forced tool call with enum constraint: define a classification tool whose input has an enum field listing all valid subagent names. Force it with tool_choice. The model must select from the valid options — no hallucinated routing."
        },
        {
          q: "SCENARIO: Your agent needs to handle both simple FAQs (high volume, low complexity) and complex debugging (low volume, high complexity). Cost-effective architecture?",
          options: ["Use the most capable model for everything", "Triage with cheap model (Haiku) → route simple to Haiku, complex to Sonnet/Opus", "Use one mid-tier model for everything", "Queue everything for human review"],
          correct: 1,
          explanation: "Two-tier: use a cheap model (Haiku) for triage/classification, then route to appropriate model. Simple FAQs stay on Haiku (cheap, fast). Complex issues go to Sonnet/Opus (capable, slower, pricier). Optimizes cost-per-request."
        },
        {
          q: "SCENARIO: After adding a new tool, the agent starts calling it for everything — even when other tools are more appropriate. What's likely wrong?",
          options: ["The new tool's name is too catchy", "The new tool's description is too broad — it doesn't specify when NOT to use it", "Tool order in the array matters", "Too many tools confuse the model"],
          correct: 1,
          explanation: "A tool description that says what it does but not when NOT to use it will attract calls in ambiguous situations. Add explicit exclusions: 'Do NOT use for X (use tool_Y instead)'. The description is the contract."
        }
      ]
    },
    {
      id: "final",
      title: "🏆 FINAL Mock Test - Am I Ready?",
      description: "20 questions, exam-weighted. Score 720+ and you're ready to book.",
      timeLimit: 40,
      passingScore: 720,
      questions: [
        {
          q: "An agent's agentic loop checks if response.content contains the word 'done' to decide when to stop. What's the fundamental flaw?",
          options: ["'done' might appear in tool results", "Should branch on stop_reason, never parse content text for control flow", "Should check for 'complete' instead", "Needs case-insensitive matching"],
          correct: 1,
          explanation: "The cardinal rule: ALWAYS branch on stop_reason. Never parse text for control flow. The model might say 'done' mid-explanation, or tool results might contain the word. stop_reason is the authoritative signal."
        },
        {
          q: "Which two domains together account for 47% of the CCA-F exam?",
          options: ["Tool Design + Context Management", "Agentic Architecture (27%) + Claude Code (20%)", "Prompts + Context", "Claude Code + Tool Design"],
          correct: 1,
          explanation: "Domain 1 (Agentic Architecture) is 27% and Domain 3 (Claude Code) is 20%, totaling 47%. These two domains are the biggest exam levers. Domain 4 (Prompts) is also 20%."
        },
        {
          q: "A production agent must guarantee that no API call exceeds $100 in cost. The system prompt says 'limit costs to $100'. Is this sufficient?",
          options: ["Yes — Claude follows cost instructions reliably", "No — cost limits must be enforced in application code (hook or middleware), not prompts", "Yes if you also add it to tool descriptions", "Only if temperature is 0"],
          correct: 1,
          explanation: "Any guarantee that MUST hold (financial, compliance, security) belongs in application-layer code. Prompts are suggestions. A PreToolUse hook that checks estimated cost before execution is the deterministic guarantee."
        },
        {
          q: "MCP defines three server primitives. What are they?",
          options: ["GET, POST, PUT", "Tools, Resources, Prompts", "Input, Output, Config", "Agents, Tasks, Hooks"],
          correct: 1,
          explanation: "MCP servers expose: Tools (callable functions), Resources (readable data), and Prompts (reusable prompt templates). Together they define how an AI model can interact with external systems."
        },
        {
          q: "You've cached your 5 tool definitions with cache_control on the last one. On call #2, cache_read_input_tokens is 0. What went wrong?",
          options: ["Model doesn't support caching", "Either the cached content changed between calls, or the ~5 min TTL expired", "Need cache_control on every tool", "Second call used a different model"],
          correct: 1,
          explanation: "Cache miss causes: content changed (any modification invalidates), TTL expired (~5 min for ephemeral), or the cache_control marker moved. Verify nothing changed between calls and they're within the TTL window."
        },
        {
          q: "A coordinator passes full subagent conversation histories between agents. Problem?",
          options: ["It's slower", "Context contamination — each subagent should only see relevant inputs and return structured outputs, not expose internal reasoning", "Higher cost only", "No problem — more context is better"],
          correct: 1,
          explanation: "Context isolation principle: subagents' internal tool calls, reasoning, and partial results should never leak to other agents. Only pass final structured outputs. This prevents cross-contamination and keeps context windows clean."
        },
        {
          q: "An invoice extraction pipeline has: Pydantic schema, forced tool_choice, validation, but NO retry ceiling. A corrupted PDF is submitted. What happens?",
          options: ["Returns null gracefully", "Infinite retry loop — validation keeps failing, API calls keep burning", "Model refuses after 3 attempts", "Schema adapts to the input"],
          correct: 1,
          explanation: "Without max_retries, a genuinely unparseable document triggers infinite validation failures → retries → failures. Each retry is a billed API call. Always set a ceiling (typically 1-2)."
        },
        {
          q: "The /compact slash command in Claude Code does what?",
          options: ["Deletes old files", "Compresses conversation history to free up context window space", "Minifies code", "Reduces file sizes"],
          correct: 1,
          explanation: "/compact triggers context compaction — summarizing the conversation history to reduce token usage while preserving essential information. Use it when context window pressure degrades quality."
        },
        {
          q: "A customer support agent has: system prompt rules + tool descriptions + PreToolUse hook. The model ignores the prompt rule but the hook catches it. This demonstrates:",
          options: ["A prompt engineering failure", "Defense in depth working correctly — each layer is a fallback for the one above", "That prompts are useless", "A model bug that should be reported"],
          correct: 1,
          explanation: "This is defense in depth working as designed. Prompts are layer 1 (guidance), tool descriptions are layer 2 (stronger guidance), hooks are layer 3 (enforcement). The hook caught what the prompt missed. System working correctly."
        },
        {
          q: "When is tool_choice: {type: 'none'} useful?",
          options: ["When you want to remove tools permanently", "When you need a text-only response this turn without removing tool definitions for future turns", "When tools are broken", "Never — always allow tool access"],
          correct: 1,
          explanation: "type: 'none' temporarily disables tools for one turn. Useful when you want a summary, explanation, or confirmation without the model taking action. Tools remain defined and available for subsequent turns."
        },
        {
          q: "A frustrated customer asks a question the agent can definitely answer. It also says 'I hate this company.' Should it escalate?",
          options: ["Yes — negative sentiment means the relationship is at risk", "No — sentiment is not an escalation trigger. Answer the question and help the customer.", "Yes — to protect the brand", "Ask the customer if they want to escalate"],
          correct: 1,
          explanation: "Never escalate on sentiment alone. The customer asked a question the agent can answer — answer it. Valid escalation triggers: policy breach, complexity, risk, or EXPLICIT request for human. Frustration ≠ escalation."
        },
        {
          q: "An SSE transport MCP server needs a Bearer token. Where does the token value go?",
          options: ["In .mcp.json directly", "In an environment variable, referenced as ${TOKEN_VAR} in the headers config", "In CLAUDE.md", "In the tool description"],
          correct: 1,
          explanation: "Auth tokens go in env vars, referenced via ${ENV_VAR} in the .mcp.json headers section. The config file is committed to git; the actual secret value lives outside source control in the environment."
        },
        {
          q: "Your agent handles 3 scenarios well but completely fails on scenario 4. The model improvises badly. Most effective fix?",
          options: ["Increase temperature for creativity", "Add few-shot examples specifically covering scenario 4's patterns", "Rewrite the entire system prompt", "Add more tools"],
          correct: 1,
          explanation: "Few-shot examples are the strongest behavior-locking mechanism for specific patterns. If 3/4 scenarios work, the general instructions are fine — you just need to show the model what correct scenario 4 handling looks like."
        },
        {
          q: "CLAUDE.md at ~/.claude/CLAUDE.md says 'use tabs for indentation'. Project CLAUDE.md says 'use spaces'. Which wins?",
          options: ["User level (tabs) always wins", "Project level (spaces) overrides user level for this project", "They conflict and Claude asks the user", "Last loaded wins"],
          correct: 1,
          explanation: "Project-level CLAUDE.md overrides user-level where they conflict. User-level provides personal defaults; project-level provides team conventions. Team conventions win within that project."
        },
        {
          q: "An agent needs to process a request that requires 4 sequential tool calls (each depends on the previous). How to ensure correct ordering?",
          options: ["Trust the model — it usually gets order right", "disable_parallel_tool_use: true + describe dependencies in tool descriptions + validate in hooks", "Call tools manually without the model", "Use 4 separate agents"],
          correct: 1,
          explanation: "Three-layer approach: disable_parallel_tool_use prevents simultaneous calls, tool descriptions state dependencies ('call AFTER X completes'), and hooks validate preconditions. Together they guarantee ordering."
        },
        {
          q: "Production monitoring for a Claude agent should track (at minimum):",
          options: ["Total API cost only", "stop_reason distribution, tool call patterns, and hook decisions", "Response length and latency only", "User satisfaction scores"],
          correct: 1,
          explanation: "The three critical streams: 1) stop_reason (is the loop behaving?), 2) tool calls (which tools, how often, what errors?), 3) hook decisions (what was blocked?). Build a dashboard on these before shipping."
        },
        {
          q: "The exam has 60 questions in 120 minutes. That's roughly how much time per question?",
          options: ["1 minute", "2 minutes", "3 minutes", "30 seconds"],
          correct: 1,
          explanation: "120 min ÷ 60 questions = 2 minutes per question. No penalty for guessing, so never leave a question blank. Flag uncertain ones and return if time permits."
        },
        {
          q: "An escalation handoff passes only: 'Customer is upset about billing. Please help.' What's missing?",
          options: ["Nothing — keep it brief", "Structured context: customer ID, specific issue, what was tried, what's blocked, recommended action", "The full transcript", "The customer's email"],
          correct: 1,
          explanation: "A good escalation summary is a mini-briefing: WHO (customer ID, plan), WHAT (specific issue), TRIED (what the agent attempted), BLOCKED (why it needs human), RECOMMENDED ACTION. The human shouldn't have to re-ask anything."
        },
        {
          q: "Your Pydantic model has Optional[str] fields. The model sometimes returns empty string '' instead of null for missing values. Best fix?",
          options: ["Pydantic validator that converts '' to None", "Few-shot example showing null for missing fields + Pydantic validator as backup", "Accept empty strings", "Make all fields required"],
          correct: 1,
          explanation: "Belt and suspenders: few-shot example shows the desired behavior (null for missing), Pydantic validator cleans up any '' that slips through. The example prevents the issue; the validator catches it if it happens anyway."
        },
        {
          q: "What is the passing score for the CCA-F exam?",
          options: ["700/1000", "720/1000", "750/1000", "800/1000"],
          correct: 1,
          explanation: "CCA-F passing score is 720 out of 1000. The exam has 60 multiple-choice questions, 120 minutes, proctored via Pearson VUE. No penalty for guessing — always answer every question."
        }
      ]
    }
  ],
  // Enrollment Guide
  enrollmentGuide: {
    title: "How to Register for the CCA-F Exam",
    steps: [
      {
        step: 1,
        title: "Create Anthropic Partner Academy Account",
        detail: "Go to anthropic-partners.skilljar.com and sign up. You need a partner organization affiliation. If your company isn't a partner yet, check with your manager or visit claude.com/partners."
      },
      {
        step: 2,
        title: "Complete Free Prep Courses (Recommended)",
        detail: "Take the 4 free courses: Claude 101, Building with the API, Intro to MCP, and Claude Code in Action. These map directly to exam domains and are available at anthropic.skilljar.com."
      },
      {
        step: 3,
        title: "Take the Anthropic Practice Exam",
        detail: "Available through the Partner Academy. Target score: 900+/1000 before scheduling the real exam. This is your best readiness indicator."
      },
      {
        step: 4,
        title: "Register & Pay ($125)",
        detail: "From the certification page in Partner Academy, click 'Register for the exam'. Pay $125. Pearson VUE will email scheduling instructions."
      },
      {
        step: 5,
        title: "Schedule via Pearson VUE",
        detail: "Log in to Pearson VUE (pearsonvue.com/anthropic). Choose online (OnVUE) or test center. No deadline — schedule when ready."
      },
      {
        step: 6,
        title: "Exam Day",
        detail: "120 minutes, 60 MCQs, closed-book, proctored. Results in 2 business days. Passing: 720/1000. No penalty for guessing — answer everything!"
      }
    ],
    links: [
      {url: "https://anthropic-partners.skilljar.com/page/partner-certifications", label: "Anthropic Partner Academy - Certifications"},
      {url: "https://www.pearsonvue.com/us/en/anthropic.html", label: "Pearson VUE - Anthropic Exams"},
      {url: "https://anthropic.skilljar.com", label: "Free Anthropic Academy Courses"}
    ]
  }
};
