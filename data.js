// Claude Certified Architect - Foundations (CCAR-F) 
// COMPLETE IN-DEPTH COURSE - Everything you need to pass
// Last updated: August 2026

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
    access: "Anthropic Partner Academy"
  },

  chapters: [
    {
      id: 1,
      title: "Agentic Architecture & Orchestration",
      weight: "27%",
      icon: "🤖",
      description: "The BIGGEST domain — 27% of your exam. Master the agentic loop, stop_reason, hooks, multi-agent patterns, and the Agent SDK.",
      sections: [
        // ===== CHAPTER 1, SECTION 1 =====
        {
          title: "1.1 — What is Claude? The Foundation",
          type: "lesson",
          content: `
<h2>🧠 Understanding Claude From the Ground Up</h2>
<p>Before we talk about agents, let's understand what Claude actually IS and how you interact with it programmatically. This is the foundation everything else builds on.</p>

<h3>Claude is a Stateless API</h3>
<p>This is the single most important thing to understand: <strong>Claude has no memory between API calls</strong>. Every single time you call the API, you send the ENTIRE conversation history. Claude reads it all, generates a response, and forgets everything.</p>

<div class="key-point">💡 <strong>Think of it like this:</strong> Imagine talking to someone who has amnesia. Every time you speak to them, you have to remind them of everything that was said before. That's Claude's API. YOU manage the memory (the message history), not Claude.</div>

<p>This means:</p>
<ul>
<li>There's no "session" on Anthropic's side — your code maintains state</li>
<li>You control exactly what Claude "remembers" by choosing what to include in messages</li>
<li>You can edit, remove, or summarize past messages before sending them</li>
<li>Context window = maximum total tokens (input + output) Claude can handle in one call</li>
</ul>

<h3>The Messages API — Your Primary Interface</h3>
<p>Everything in Claude's world goes through one endpoint: <code>messages.create()</code></p>

<div class="code-block">import anthropic

client = anthropic.Anthropic()  # Uses ANTHROPIC_API_KEY env var

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a helpful assistant.",  # Optional system prompt
    messages=[
        {"role": "user", "content": "What is 2 + 2?"}
    ]
)

print(response.content[0].text)   # "2 + 2 = 4"
print(response.stop_reason)        # "end_turn"
print(response.usage.input_tokens) # How many tokens you sent
print(response.usage.output_tokens)# How many tokens Claude generated</div>

<h3>The Response Object — What Comes Back</h3>
<p>When Claude responds, you get a structured object with these key fields:</p>

<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-weight: bold;">content</td>
<td style="padding: 8px;">Array of content blocks. Can be <code>TextBlock</code> (text response) or <code>ToolUseBlock</code> (tool call request). This is what Claude "said" or "wants to do."</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-weight: bold;">stop_reason</td>
<td style="padding: 8px;">WHY Claude stopped generating. This is the most important field for agent control flow.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-weight: bold;">model</td>
<td style="padding: 8px;">Which model actually processed the request.</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px; color: var(--accent-light); font-weight: bold;">usage</td>
<td style="padding: 8px;">Token counts: input_tokens, output_tokens, and cache-related fields.</td>
</tr>
</table>

<h3>The Model Lineup (Know These for the Exam)</h3>
<ul>
<li><strong>Claude Opus 4</strong> — Most capable. Use for complex reasoning, multi-step tasks. Expensive.</li>
<li><strong>Claude Sonnet 4</strong> — Best balance of capability and cost. Default for most production use.</li>
<li><strong>Claude Haiku 4.5</strong> — Fastest and cheapest. Use for triage, classification, simple tasks.</li>
</ul>

<div class="exam-tip">🎓 <strong>Exam Principle:</strong> Pick the SMALLEST model that does the job. Haiku for triage/classification, Sonnet for general work, Opus only when you genuinely need maximum reasoning power. Cost efficiency is a real exam topic.</div>

<h3>Messages Format — The Conversation Shape</h3>
<p>Messages alternate between "user" and "assistant" roles:</p>
<div class="code-block">messages = [
    {"role": "user", "content": "Hi, I need help with my account"},
    {"role": "assistant", "content": "I'd be happy to help! What's your account ID?"},
    {"role": "user", "content": "It's ACCT-12345"},
    {"role": "assistant", "content": "Let me look that up for you..."}
    # Claude generates the next response
]</div>

<div class="key-point">💡 <strong>Key Rule:</strong> Messages MUST alternate user/assistant. You can't have two user messages in a row or two assistant messages in a row. The last message must always be from the user (because Claude generates the next assistant response).</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> This basic structure — stateless API, messages array, alternating roles — is assumed knowledge. The exam won't ask "what's an API call?" but it WILL test whether you understand that the agent manages state, not Claude.</div>
`
        },
        // ===== CHAPTER 1, SECTION 2 =====
        {
          title: "1.2 — stop_reason: The Brain of Every Agent",
          type: "lesson",
          content: `
<h2>🌳 The Six stop_reason Values — Your Agent's Decision Engine</h2>
<p>If there's ONE thing you take from this entire course, it's this: <strong>stop_reason controls your agent's behavior</strong>. Every agent you'll ever build is a loop that checks stop_reason and decides what to do next.</p>

<h3>Why Does Claude "Stop"?</h3>
<p>When you call the API, Claude generates tokens one by one. At some point it stops. The question is: WHY did it stop? That "why" is the <code>stop_reason</code> field, and it tells you exactly what your code should do next.</p>

<h3>The Six Values — Memorize These</h3>

<p><strong>1. <code>end_turn</code></strong> — "I'm done talking"</p>
<div class="code-block"># Claude finished its response naturally.
# Your agent loop should: Return this response to the user.
# This is the exit condition for most loops.

if response.stop_reason == "end_turn":
    final_answer = response.content[0].text
    return final_answer  # Done! Show to user.</div>

<p><strong>2. <code>tool_use</code></strong> — "I need to call a tool"</p>
<div class="code-block"># Claude wants to call one or more tools before continuing.
# Your agent loop should: Execute the tool(s), append results, call API again.
# This is what makes agents "agentic" — they can take actions!

if response.stop_reason == "tool_use":
    # Claude's response contains ToolUseBlock(s)
    # Execute them, get results, continue the loop</div>

<p><strong>3. <code>max_tokens</code></strong> — "I ran out of space"</p>
<div class="code-block"># Claude hit the max_tokens limit you set. Response is TRUNCATED.
# Your agent loop should: Handle continuation or inform the user.
# This is NOT normal completion — the response is cut off!

if response.stop_reason == "max_tokens":
    # Option A: Append what we got and ask Claude to continue
    # Option B: Inform user the response was truncated
    # Option C: Increase max_tokens and retry</div>

<p><strong>4. <code>stop_sequence</code></strong> — "I hit your custom stop marker"</p>
<div class="code-block"># You defined a custom stop sequence and Claude generated it.
# Used for structured parsing (e.g., stop at "###END###")
# Less common in agent architectures but useful for extraction.

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    stop_sequences=["###END###"],  # Custom stop marker
    messages=[...]
)
# If Claude generates "###END###", it stops there</div>

<p><strong>5. <code>pause_turn</code></strong> — "I'm yielding control but I'm not done"</p>
<div class="code-block"># Agent SDK specific. The agent paused voluntarily.
# Your code decides: resume (continue) or fork (branch).
# Think of it as a checkpoint — the agent is saying "check in with me"

if response.stop_reason == "pause_turn":
    # Option A: Resume - continue where we left off
    # Option B: Fork - branch into a new conversation from this point</div>

<p><strong>6. <code>refusal</code></strong> — "I won't do that"</p>
<div class="code-block"># Claude refused the request (safety/policy violation).
# Your agent loop should: Handle gracefully, log, maybe rephrase.
# Don't retry the same request — it'll refuse again.

if response.stop_reason == "refusal":
    log.warning("Claude refused request")
    return "I'm unable to help with that request."</div>

<h3>The Cardinal Rule</h3>
<div class="warning-point">⚠️ <strong>NEVER, EVER parse the text content to decide what to do.</strong>
<br><br>
❌ Bad: <code>if "I'm done" in response.content[0].text</code><br>
❌ Bad: <code>if response.content[0].text.endswith(".")</code><br>
❌ Bad: <code>if "TASK COMPLETE" in response.content[0].text</code><br>
<br>
✅ Good: <code>if response.stop_reason == "end_turn"</code><br>
<br>
The model might say "I'm done" in the middle of a thought. It might say "TASK COMPLETE" while describing what it's going to do. Text is unreliable. <code>stop_reason</code> is the TRUTH.</div>

<h3>Real-World Scenario: What Goes Wrong</h3>
<p>Imagine this production bug:</p>
<div class="code-block"># BROKEN agent loop
while True:
    response = client.messages.create(...)
    text = response.content[0].text
    
    if "thank you" in text.lower():  # ❌ WRONG!
        return text  # Agent stops whenever Claude says "thank you"
    
    # This agent will stop mid-conversation whenever Claude says
    # "Thank you for providing that information, let me look it up..."
    # The agent exits before doing its job!</div>

<div class="code-block"># CORRECT agent loop
while True:
    response = client.messages.create(...)
    
    if response.stop_reason == "end_turn":  # ✅ CORRECT
        return extract_text(response)
    elif response.stop_reason == "tool_use":
        # Execute tools and continue
        pass</div>

<h3>Quick Reference Decision Tree</h3>
<div class="code-block">stop_reason received → What to do:
─────────────────────────────────────
end_turn      → Return response to user (EXIT loop)
tool_use      → Execute tool(s), append results, CONTINUE loop
max_tokens    → Handle truncation (continue, summarize, or error)
stop_sequence → Process the partial response up to that point
pause_turn    → Resume or fork (Agent SDK only)
refusal       → Handle gracefully, don't retry same request</div>

<div class="exam-tip">🎓 <strong>Exam Frequency:</strong> This concept appears in almost EVERY Domain 1 question. The exam will describe broken agent behavior and ask "what went wrong?" — the answer is almost always a stop_reason handling error. Know these six values cold.</div>
`
        },
        // ===== CHAPTER 1, SECTION 3 =====
        {
          title: "1.3 — Building the Agentic Loop Step-by-Step",
          type: "lesson",
          content: `
<h2>🔄 The Agentic Loop — The Heart of Every Claude Agent</h2>
<p>An "agent" is just a loop that calls the Claude API repeatedly, executing tools between calls, until Claude says it's done (stop_reason = end_turn). That's it. Let's build it from scratch.</p>

<h3>The Simplest Possible Agent</h3>
<p>Start with the absolute minimum — a loop with one tool:</p>

<div class="code-block">import anthropic
import json

client = anthropic.Anthropic()

# Step 1: Define a tool
tools = [{
    "name": "get_weather",
    "description": "Get current weather for a city. Use when the user asks about weather conditions.",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name"}
        },
        "required": ["city"]
    }
}]

# Step 2: Tool execution function
def execute_tool(name, inputs):
    if name == "get_weather":
        # In production: call a real weather API
        return json.dumps({"temp": 72, "condition": "sunny", "city": inputs["city"]})
    return json.dumps({"error": f"Unknown tool: {name}"})

# Step 3: The agent loop
def run_agent(user_message):
    messages = [{"role": "user", "content": user_message}]
    
    while True:
        # Call Claude
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            tools=tools,
            messages=messages
        )
        
        # Branch on stop_reason (THE critical decision)
        if response.stop_reason == "end_turn":
            # Claude is done — extract and return text
            return "".join(b.text for b in response.content if hasattr(b, 'text'))
        
        elif response.stop_reason == "tool_use":
            # Claude wants to use a tool
            # Step A: Add Claude's response to message history
            messages.append({"role": "assistant", "content": response.content})
            
            # Step B: Execute each tool and collect results
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,  # MUST match!
                        "content": result
                    })
            
            # Step C: Add tool results as a "user" message
            messages.append({"role": "user", "content": tool_results})
            # Loop continues — Claude will process the results
        
        else:
            # Handle other cases (max_tokens, refusal, etc.)
            return f"Agent stopped unexpectedly: {response.stop_reason}"</div>

<h3>Let's Trace Through an Example</h3>
<p>User says: "What's the weather in Tokyo?"</p>

<div class="code-block">Iteration 1:
  → Send: [{"role": "user", "content": "What's the weather in Tokyo?"}]
  ← Receive: stop_reason = "tool_use"
             content = [ToolUseBlock(name="get_weather", input={"city": "Tokyo"})]
  
  Action: Execute get_weather("Tokyo") → {"temp": 72, "condition": "sunny"}
  Append: assistant message + tool_result to messages

Iteration 2:
  → Send: [user msg, assistant tool_use, user tool_result]
  ← Receive: stop_reason = "end_turn"
             content = [TextBlock("The weather in Tokyo is 72°F and sunny!")]
  
  Action: Return text to user. DONE! Loop exits.</div>

<div class="key-point">💡 <strong>Key Insight:</strong> Notice the message structure during tool calls:
<ol>
<li>User message (the original request)</li>
<li>Assistant message (contains tool_use blocks — Claude's "intent")</li>
<li>User message (contains tool_result blocks — the actual results)</li>
<li>Then Claude generates the next assistant message</li>
</ol>
The roles always alternate: user → assistant → user → assistant. Tool results go in a "user" role message because from Claude's perspective, you (the user/system) are providing the tool's output.</div>

<h3>Multiple Tool Calls in One Response</h3>
<p>Claude can request MULTIPLE tools in a single response (parallel tool use):</p>

<div class="code-block"># Claude might respond with:
content = [
    TextBlock("Let me check both cities for you."),
    ToolUseBlock(id="call_1", name="get_weather", input={"city": "Tokyo"}),
    ToolUseBlock(id="call_2", name="get_weather", input={"city": "London"})
]

# You must return results for ALL tool calls:
tool_results = [
    {"type": "tool_result", "tool_use_id": "call_1", "content": "..."},
    {"type": "tool_result", "tool_use_id": "call_2", "content": "..."}
]</div>

<h3>The tool_use_id — Why It Matters</h3>
<p>Every tool_use block has a unique <code>id</code>. Your tool_result MUST include the matching <code>tool_use_id</code>. This is how Claude knows which result corresponds to which call.</p>

<div class="warning-point">⚠️ <strong>Common Bug:</strong> Forgetting to match tool_use_id in tool_results. If IDs don't match, Claude can't correlate results and the conversation breaks. Always extract the ID from each tool_use block and include it in the corresponding result.</div>

<h3>Iteration Limits — Don't Loop Forever</h3>
<div class="code-block">MAX_ITERATIONS = 20  # Safety ceiling

def run_agent_safe(user_message):
    messages = [{"role": "user", "content": user_message}]
    
    for i in range(MAX_ITERATIONS):
        response = client.messages.create(...)
        
        if response.stop_reason == "end_turn":
            return extract_text(response)
        elif response.stop_reason == "tool_use":
            # ... execute tools ...
            pass
        else:
            return f"Unexpected stop: {response.stop_reason}"
    
    # If we get here, something is wrong
    return "Agent exceeded maximum iterations. Possible infinite loop."</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> The exam tests whether you understand the EXACT message structure: assistant messages contain tool_use blocks, the next user message contains tool_result blocks with matching IDs. They'll show you broken code and ask what's wrong — usually a message structure issue.</div>
`
        },
        // ===== CHAPTER 1, SECTION 4 =====
        {
          title: "1.4 — Tools Deep Dive: Definition, Execution & Errors",
          type: "lesson",
          content: `
<h2>🔧 Tools — Giving Your Agent Hands</h2>
<p>Without tools, Claude can only talk. With tools, Claude can DO things — look up data, process payments, send emails, search databases. Let's understand every aspect of how tools work.</p>

<h3>Anatomy of a Tool Definition</h3>
<p>A tool has three parts:</p>
<div class="code-block">{
    "name": "process_refund",
    
    "description": "Process a refund to a customer's original payment method. "
                   "Use ONLY after: 1) Customer identity is verified, "
                   "2) The specific charge is identified, "
                   "3) Amount is within policy limits ($500 max). "
                   "Do NOT use for: store credits, exchanges, or disputes. "
                   "Returns: {success: true, refund_id: string} on success, "
                   "or {isError: true, ...} on failure.",
    
    "input_schema": {
        "type": "object",
        "properties": {
            "customer_id": {
                "type": "string",
                "description": "Verified customer ID (format: CUST-XXXXX)"
            },
            "charge_id": {
                "type": "string", 
                "description": "The specific charge to refund (format: CHG-XXXXX)"
            },
            "amount_cents": {
                "type": "integer",
                "description": "Refund amount in cents. Max 50000 ($500)."
            },
            "reason": {
                "type": "string",
                "enum": ["defective", "not_received", "wrong_item", "other"],
                "description": "Categorized refund reason"
            }
        },
        "required": ["customer_id", "charge_id", "amount_cents", "reason"]
    }
}</div>

<h3>The Description is the CONTRACT</h3>
<p>This is the single most important principle of tool design:</p>

<div class="key-point">💡 <strong>The description tells Claude EVERYTHING about the tool:</strong>
<ul>
<li><strong>What</strong> it does (process a refund to original payment method)</li>
<li><strong>When</strong> to use it (after identity verified, charge identified, within limits)</li>
<li><strong>When NOT</strong> to use it (not for credits, exchanges, or disputes)</li>
<li><strong>What inputs mean</strong> (format expectations, limits)</li>
<li><strong>What output looks like</strong> (success shape vs error shape)</li>
</ul>
Names are just labels. Descriptions are contracts.</div>

<p>Compare these two descriptions:</p>
<div class="code-block">// ❌ BAD — Claude has to guess behavior
"description": "Processes a refund"

// ✅ GOOD — Claude knows exactly how and when to use this
"description": "Process a refund to a customer's original payment method. "
               "Use ONLY after: 1) Customer identity is verified, "
               "2) The specific charge is identified. "
               "Max refund: $500. Do NOT use for store credits or exchanges."</div>

<h3>Structured Errors — Teaching Claude What Went Wrong</h3>
<p>When a tool fails, don't return a vague string. Return structured data so Claude can make an intelligent decision:</p>

<div class="code-block">// ❌ BAD — Claude has to guess what happened
return "Error: something went wrong"

// ✅ GOOD — Claude knows exactly what happened and what to do
return json.dumps({
    "isError": True,
    "errorCategory": "policy",      # transient | permanent | policy
    "isRetryable": False,
    "message": "Refund of $750 exceeds $500 policy limit. Escalate to manager.",
    "suggestedAction": "escalate"
})</div>

<h3>The Three Error Categories</h3>
<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
<tr style="border-bottom: 1px solid var(--border); background: rgba(108,99,255,0.05);">
<td style="padding: 10px; font-weight: bold;">Category</td>
<td style="padding: 10px; font-weight: bold;">Meaning</td>
<td style="padding: 10px; font-weight: bold;">Claude's Response</td>
<td style="padding: 10px; font-weight: bold;">Example</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 10px; color: var(--warning);">transient</td>
<td style="padding: 10px;">Temporary failure</td>
<td style="padding: 10px;">Retry after a moment</td>
<td style="padding: 10px;">Database timeout, rate limit</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 10px; color: var(--danger);">permanent</td>
<td style="padding: 10px;">Cannot be fixed by retrying</td>
<td style="padding: 10px;">Tell user, try different approach</td>
<td style="padding: 10px;">Customer not found, invalid ID</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 10px; color: var(--accent-light);">policy</td>
<td style="padding: 10px;">Blocked by business rules</td>
<td style="padding: 10px;">Explain constraint or escalate</td>
<td style="padding: 10px;">Over refund limit, unauthorized</td>
</tr>
</table>

<h3>Tool Input Schema — JSON Schema Basics</h3>
<p>Tool inputs use JSON Schema (draft 2020-12). Key types you'll see:</p>
<div class="code-block">{
    "type": "object",
    "properties": {
        "name": {"type": "string"},                    // Text
        "age": {"type": "integer"},                    // Whole number
        "score": {"type": "number"},                   // Decimal OK
        "active": {"type": "boolean"},                 // true/false
        "tags": {"type": "array", "items": {"type": "string"}},  // List
        "status": {
            "type": "string", 
            "enum": ["active", "inactive", "pending"]  // Fixed choices
        }
    },
    "required": ["name", "age"]  // These MUST be provided
}</div>

<h3>How Many Tools Should an Agent Have?</h3>
<ul>
<li><strong>3-7 tools</strong> — Sweet spot. Claude can reason about them all clearly.</li>
<li><strong>8-15 tools</strong> — Works but consider grouping or using a triage step.</li>
<li><strong>15+ tools</strong> — Performance degrades. The model gets confused about which to pick. Use scoped subagents or a two-stage selection approach.</li>
</ul>

<div class="exam-tip">🎓 <strong>Exam Scenarios:</strong> The exam loves scenarios where the wrong tool is called. The fix is almost always: improve the tool description (add when NOT to use), reduce tool overlap, or scope tools per subagent. Never blame the model — fix the contract.</div>
`
        },
        // ===== CHAPTER 1, SECTION 5 =====
        {
          title: "1.5 — Hooks: Deterministic Policy Enforcement",
          type: "lesson",
          content: `
<h2>🛡️ Hooks — When "Please Don't" Isn't Enough</h2>
<p>Here's the hard truth about prompts: they're SUGGESTIONS. Claude usually follows them. But "usually" isn't enough when real money, real data, or real compliance is on the line.</p>

<h3>The Three Layers of Defense</h3>
<div class="code-block">Layer 1: System Prompt
  "Do not process refunds over $500"
  → Guidance. Claude usually follows this.
  → But an adversarial user prompt MIGHT override it.
  → Reliability: ~95%

Layer 2: Tool Description
  "Maximum amount: $500. Do not process above this."
  → Stronger guidance. Part of the tool contract.
  → Claude almost always respects this.
  → Reliability: ~99%

Layer 3: Application-Layer Hook (Code)
  if amount > 500: return ERROR
  → DETERMINISTIC. Cannot be overridden by any prompt.
  → Doesn't matter what Claude "wants" to do.
  → Reliability: 100%</div>

<div class="key-point">💡 <strong>The Rule:</strong> If a guarantee MUST hold (money, compliance, security, legal), it goes in Layer 3 (code). If it's a preference or guideline, Layer 1 or 2 is fine.
<br><br>
Think of it like this: Would you rely on a sticky note saying "don't open this door" to protect a bank vault? No — you use a lock (code). The sticky note (prompt) is helpful context, but the lock is the guarantee.</div>

<h3>Hook Lifecycle Events</h3>
<p>Hooks fire at specific points in the agent's lifecycle:</p>

<p><strong>PreToolUse</strong> — BEFORE a tool executes</p>
<div class="code-block"># Fires: After Claude requests a tool call, BEFORE you execute it
# Purpose: Gate access, validate parameters, enforce policy
# Can: Block the call, modify parameters, require approval
# Example: Check refund amount before processing

def pre_tool_hook(tool_name, tool_input):
    if tool_name == "process_refund":
        amount = tool_input.get("amount_cents", 0)
        if amount > 50000:  # $500 in cents
            return {
                "blocked": True,
                "error": "Policy: refunds over $500 require manager approval"
            }
    return {"blocked": False}  # Allow the call</div>

<p><strong>PostToolUse</strong> — AFTER a tool returns</p>
<div class="code-block"># Fires: After tool executes, BEFORE result goes back to Claude
# Purpose: Audit, filter sensitive data, transform output, log
# Can: Modify the result, add metadata, log for compliance

def post_tool_hook(tool_name, tool_input, tool_result):
    # Audit log every tool call
    audit_log.write({
        "timestamp": now(),
        "tool": tool_name,
        "input": tool_input,
        "result": tool_result,
        "agent_session": current_session_id
    })
    
    # Filter PII from results before sending back to Claude
    if "ssn" in tool_result:
        tool_result["ssn"] = "***-**-" + tool_result["ssn"][-4:]
    
    return tool_result  # Possibly modified</div>

<p><strong>SessionStart</strong> — When a new session begins</p>
<div class="code-block"># Fires: At the beginning of a new agent session
# Purpose: Inject context, load user preferences, set up state
# Example: Load customer's account status and preferences

def session_start_hook(session_context):
    customer = load_customer(session_context.customer_id)
    return {
        "inject_context": f"Customer: {customer.name}, "
                         f"Plan: {customer.plan}, "
                         f"Status: {customer.status}"
    }</div>

<p><strong>Stop</strong> — Before the final response goes to the user</p>
<div class="code-block"># Fires: After Claude generates its final response (end_turn)
# Purpose: Final validation, content filtering, compliance check
# Example: Ensure no internal tool names leak to the user

def stop_hook(final_response):
    # Don't expose internal system details
    for internal_term in ["tool_use", "INTERNAL:", "DEBUG:"]:
        if internal_term in final_response:
            return {"override": "I apologize, let me rephrase that..."}
    return {"allow": True}</div>

<h3>Critical Hook Behavior: Fail CLOSED</h3>
<div class="warning-point">⚠️ <strong>If a hook itself crashes (unhandled exception), the correct behavior is to BLOCK the action.</strong>
<br><br>
Why? Because if you can't verify the policy, you must assume the action is unsafe.
<br><br>
❌ Bad: Hook crashes → skip hook → execute tool anyway<br>
✅ Good: Hook crashes → block tool → log error → alert ops team<br>
<br>
Silent hook failures are how compliance quietly evaporates in production. One day someone asks "how did that $10,000 refund get processed?" and the answer is "the hook crashed and we failed open."</div>

<h3>Hooks in Claude Code (settings.json)</h3>
<div class="code-block">// In Claude Code, hooks are configured in settings:
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "process_refund",  // Which tool to gate
      "command": "python validate_refund.py"  // Script to run
    }],
    "PostToolUse": [{
      "matcher": "*",  // All tools
      "command": "python audit_log.py"  // Log everything
    }]
  }
}</div>

<h3>When to Use Which Layer — Decision Framework</h3>
<div class="code-block">Question: "Where should this rule go?"

If the consequence of violation is:
  • Style/preference → System prompt or CLAUDE.md
  • User experience → Tool description
  • Money loss → PreToolUse hook (application code)
  • Security breach → PreToolUse hook + additional auth
  • Legal/compliance → PreToolUse hook + audit (PostToolUse)
  • Data loss → PreToolUse hook + confirmation flow

Rule of thumb: Higher consequence = deeper layer</div>

<div class="exam-tip">🎓 <strong>Exam Pattern:</strong> The exam will describe a scenario with a policy violation and ask "where should this policy be enforced?" The answer choices will include: system prompt, tool description, hook, temperature setting. For any MUST-HOLD guarantee, the answer is always the hook/application code. This question pattern appears in almost every exam.</div>
`
        },
        // ===== CHAPTER 1, SECTION 6 =====
        {
          title: "1.6 — Multi-Agent Architecture: Coordinator & Subagents",
          type: "lesson",
          content: `
<h2>🏗️ When One Agent Isn't Enough</h2>
<p>A single agent with 20 tools, a long conversation, and multiple responsibilities will eventually degrade. Multi-agent architecture solves this by splitting work across specialized agents.</p>

<h3>Why Split Into Multiple Agents?</h3>
<p>Splitting makes sense when:</p>
<ul>
<li><strong>Tool scope</strong> — A research agent shouldn't have write access to production databases</li>
<li><strong>Context isolation</strong> — One agent's internal reasoning shouldn't pollute another's context</li>
<li><strong>Independent subtasks</strong> — Research and synthesis can be done by specialists</li>
<li><strong>Different models</strong> — Use cheap models for triage, expensive ones for complex reasoning</li>
<li><strong>Observability</strong> — Easier to debug when each agent has a clear responsibility</li>
</ul>

<h3>When NOT to Split</h3>
<ul>
<li><strong>Heavy shared state</strong> — If agents constantly need each other's data, merging is simpler</li>
<li><strong>Simple tasks</strong> — A 3-tool chatbot doesn't need multi-agent complexity</li>
<li><strong>Latency sensitive</strong> — Each agent adds an API round-trip</li>
<li><strong>Theoretical purity</strong> — Don't split just because it "feels cleaner"</li>
</ul>

<h3>The Hub-and-Spoke Pattern (Most Common)</h3>
<div class="code-block">                    ┌─────────────┐
                    │ COORDINATOR │
                    │             │
                    │ Roles:      │
                    │ • Understand│
                    │   user need │
                    │ • Dispatch  │
                    │   to agents │
                    │ • Synthesize│
                    │   results   │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼─────┐ ┌─────▼──────┐ ┌────▼───────┐
     │  RESEARCH  │ │  ANALYSIS  │ │   ACTION   │
     │  Agent     │ │  Agent     │ │   Agent    │
     │            │ │            │ │            │
     │ Tools:     │ │ Tools:     │ │ Tools:     │
     │ • search   │ │ • compute  │ │ • update   │
     │ • fetch    │ │ • compare  │ │ • notify   │
     │ • read_doc │ │ • classify │ │ • process  │
     │            │ │            │ │            │
     │ Model:     │ │ Model:     │ │ Model:     │
     │ Haiku      │ │ Sonnet     │ │ Sonnet     │
     └────────────┘ └────────────┘ └────────────┘</div>

<h3>Context Isolation — The Critical Principle</h3>
<p>This is the most important concept in multi-agent design:</p>

<div class="key-point">💡 <strong>Each subagent runs its own independent conversation.</strong> Its messages array is SEPARATE from the coordinator's. Only the FINAL OUTPUT flows back to the coordinator, never the internal tool calls, reasoning, or intermediate steps.</div>

<div class="code-block">def run_subagent(role, system_prompt, task, agent_tools):
    """Each subagent gets its own isolated conversation."""
    # This messages array is INDEPENDENT of the coordinator
    messages = [{"role": "user", "content": task}]
    
    # The subagent runs its own loop
    for _ in range(10):  # Safety limit
        response = client.messages.create(
            model="claude-haiku-4-5-20251016",  # Cheap for subtasks
            system=system_prompt,
            tools=agent_tools,        # SCOPED tools — only what this agent needs
            messages=messages          # ISOLATED — only this agent's history
        )
        
        if response.stop_reason == "end_turn":
            # Return ONLY the final text — not the full conversation
            return "".join(b.text for b in response.content if hasattr(b, 'text'))
        
        elif response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            results = execute_tools(response.content, agent_tools)
            messages.append({"role": "user", "content": results})
    
    return "Subagent reached iteration limit"

def coordinator(user_request):
    """The coordinator dispatches and synthesizes."""
    # Coordinator decides what needs to happen
    plan_response = client.messages.create(
        model="claude-sonnet-4-20250514",
        system="You are a coordinator. Analyze the request and break into subtasks.",
        messages=[{"role": "user", "content": user_request}]
    )
    
    # Dispatch to specialized subagents
    research_result = run_subagent(
        role="researcher",
        system_prompt="You research information. Be thorough and cite sources.",
        task=f"Research this: {user_request}",
        agent_tools=[search_tool, fetch_tool]  # Read-only tools!
    )
    
    analysis_result = run_subagent(
        role="analyst",
        system_prompt="You analyze data and provide insights.",
        task=f"Analyze this research: {research_result}",
        agent_tools=[compute_tool, classify_tool]
    )
    
    # Coordinator synthesizes
    final = client.messages.create(
        model="claude-sonnet-4-20250514",
        system="Synthesize these results into a clear, cohesive response.",
        messages=[{"role": "user", "content": f"Research: {research_result}\\n\\nAnalysis: {analysis_result}\\n\\nOriginal question: {user_request}"}]
    )
    
    return final.content[0].text</div>

<h3>What "Context Isolation" Prevents</h3>
<div class="code-block">// WITHOUT isolation (BAD):
Coordinator sees: [
    user_request,
    research_agent_tool_call_1,   // ← LEAKED! Coordinator didn't need this
    research_agent_tool_result_1,  // ← LEAKED!
    research_agent_tool_call_2,   // ← LEAKED!  
    research_agent_thinking,      // ← LEAKED!
    research_final_answer,        // Only this was needed
    analysis_agent_tool_call_1,   // ← LEAKED!
    ...
]
// Result: bloated context, confused coordinator, higher costs

// WITH isolation (GOOD):
Coordinator sees: [
    user_request,
    research_final_answer,    // Only the output
    analysis_final_answer,    // Only the output
]
// Result: clean context, focused coordinator, lower costs</div>

<h3>Session Resume vs Fork</h3>
<p>Two ways to continue a conversation:</p>

<p><strong>Resume</strong> — Continue the SAME conversation linearly</p>
<div class="code-block">// User comes back after a break. Same topic, same context.
session.resume()  // Pick up where we left off
// messages = [all previous messages] + new user message</div>

<p><strong>Fork</strong> — Branch into a NEW conversation from a shared point</p>
<div class="code-block">// Explore two approaches in parallel from the same starting point
session_a = session.fork()  // Try approach A
session_b = session.fork()  // Try approach B
// Both share history UP TO the fork point, then diverge</div>

<div class="key-point">💡 <strong>When to use which:</strong>
<br>• <strong>Resume</strong>: User returns to continue a task. Same linear conversation.
<br>• <strong>Fork</strong>: Parallel exploration. "Let's try two different approaches and compare."</div>

<div class="exam-tip">🎓 <strong>Exam Patterns:</strong>
<br>• "What isolates subagent context?" → Separate message arrays, only final output shared
<br>• "When to split vs keep single?" → Split when tools need scoping, context is bloating, subtasks are independent
<br>• "What's the coordinator's job?" → Understand intent, dispatch, synthesize results
<br>• "Resume vs Fork?" → Resume = continue linearly, Fork = parallel branching</div>
`
        },
        // ===== CHAPTER 1, SECTION 7 =====
        {
          title: "1.7 — The Claude Agent SDK",
          type: "lesson",
          content: `
<h2>⚙️ Agent SDK — The Production Framework</h2>
<p>Everything we've built by hand (the loop, hooks, multi-agent dispatch) is packaged in the Claude Agent SDK. It's Anthropic's official framework for building production agents.</p>

<h3>SDK vs Raw API — When to Use Which</h3>
<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
<tr style="border-bottom: 1px solid var(--border); background: rgba(108,99,255,0.05);">
<td style="padding: 10px; font-weight: bold;">Aspect</td>
<td style="padding: 10px; font-weight: bold;">Raw Messages API</td>
<td style="padding: 10px; font-weight: bold;">Agent SDK</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 10px;">Loop management</td>
<td style="padding: 10px;">You write the while loop</td>
<td style="padding: 10px;">SDK manages it for you</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 10px;">Hook lifecycle</td>
<td style="padding: 10px;">You implement hook checks manually</td>
<td style="padding: 10px;">Built-in hook system with decorators</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 10px;">Multi-agent</td>
<td style="padding: 10px;">You manage message arrays per agent</td>
<td style="padding: 10px;">Task primitive handles isolation</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 10px;">Settings loading</td>
<td style="padding: 10px;">Manual</td>
<td style="padding: 10px;">Auto-loads from CLAUDE.md</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 10px;">Control</td>
<td style="padding: 10px;">Total — you decide everything</td>
<td style="padding: 10px;">Convenient but less flexible</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 10px;">Best for</td>
<td style="padding: 10px;">Custom/unusual architectures, learning</td>
<td style="padding: 10px;">Standard production agents</td>
</tr>
</table>

<h3>Core SDK Concepts</h3>
<div class="code-block">from claude_agent_sdk import Agent, Task, Hook

# Define an agent
support_agent = Agent(
    name="customer-support",
    model="claude-sonnet-4-20250514",
    system="You are a customer support agent for Acme Corp.",
    tools=[lookup_customer, check_order, process_refund],
    hooks=[RefundPolicyHook()],
    settingSources=["user", "project"]  # Load CLAUDE.md from both levels
)

# Run a task
result = support_agent.run("Help me with order ORD-12345")
print(result.output)</div>

<h3>The Task Primitive</h3>
<p>For multi-agent workflows, Task handles orchestration:</p>
<div class="code-block">from claude_agent_sdk import Agent, Task

# Define specialized agents
research_agent = Agent(
    name="researcher",
    model="claude-haiku-4-5-20251016",
    tools=[search_tool, fetch_tool],
    system="You research information thoroughly."
)

synthesis_agent = Agent(
    name="synthesizer",
    model="claude-sonnet-4-20250514",
    tools=[format_tool, cite_tool],
    system="You synthesize research into clear summaries with citations."
)

# Task coordinates them automatically
task = Task(
    name="research-and-summarize",
    agents=[research_agent, synthesis_agent],
    coordinator_model="claude-sonnet-4-20250514",
    max_iterations=20
)

result = task.run("Explain the current state of quantum computing")
# Task handles: dispatch, context isolation, result passing, synthesis</div>

<h3>SDK Hook Classes</h3>
<div class="code-block">from claude_agent_sdk import Hook

class RefundPolicyHook(Hook):
    """Blocks refunds over $500."""
    event = "PreToolUse"
    
    def should_fire(self, tool_name, tool_input):
        """Only fire for the refund tool."""
        return tool_name == "process_refund"
    
    def execute(self, tool_name, tool_input):
        """Check the amount and block if over limit."""
        amount = tool_input.get("amount_cents", 0)
        if amount > 50000:  # $500 in cents
            return {
                "block": True,
                "error_message": f"Policy violation: Refund amount "
                                f"({amount/100:.2f}) exceeds $500 limit. "
                                f"Escalate to manager."
            }
        return {"block": False}

class AuditHook(Hook):
    """Logs all tool calls for compliance."""
    event = "PostToolUse"
    
    def should_fire(self, tool_name, tool_input):
        return True  # Fire for ALL tools
    
    def execute(self, tool_name, tool_input, tool_result):
        audit_log.record(
            tool=tool_name,
            input=tool_input,
            result=tool_result,
            timestamp=now(),
            session=self.session_id
        )
        return tool_result  # Pass through unchanged</div>

<h3>settingSources — Loading CLAUDE.md</h3>
<div class="code-block"># The SDK loads instructions from CLAUDE.md files:
agent = Agent(
    settingSources=["user", "project"]
)
# "user" → loads ~/.claude/CLAUDE.md (personal defaults)
# "project" → loads ./CLAUDE.md (team conventions)
# Both are merged, project overrides user on conflicts</div>

<div class="key-point">💡 <strong>Key Insight:</strong> The Agent SDK is CONVENIENCE, not magic. It does exactly what we built by hand in the previous sections — the agentic loop, hook checks, multi-agent isolation. If you understand the raw API, you understand what the SDK is doing underneath. The exam tests both.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> Know the relationship: Agent SDK builds ON TOP of the Messages API. Task is the multi-agent primitive. Hooks are lifecycle callbacks. settingSources loads CLAUDE.md. The exam may ask about either the SDK or raw API — they test the same concepts at different abstraction levels.</div>
`
        },
        // ===== CHAPTER 1, SECTION 8 =====
        {
          title: "1.8 — Real Exam Scenarios & Anti-Patterns",
          type: "lesson",
          content: `
<h2>🎯 How Domain 1 Appears on the Exam</h2>
<p>The exam uses 6 possible scenarios (4 randomly selected). Here's how Domain 1 concepts map to them:</p>

<h3>Scenario: Customer Support Agent</h3>
<div class="code-block">Setup: You're building a support agent for an e-commerce company.
       It handles order lookups, refund processing, and escalation.

Typical questions test:
• When should the agent escalate vs handle itself? (hook + policy)
• How to prevent over-limit refunds? (PreToolUse hook)
• Agent processes refund despite prompt saying "max $500" — what failed? 
  (Prompt is suggestion, need application-layer enforcement)
• Customer says "talk to human" — what should happen?
  (Immediate escalation, no more tool calls)</div>

<h3>Scenario: Multi-Agent Research System</h3>
<div class="code-block">Setup: A research system with coordinator + research + synthesis agents.

Typical questions test:
• How to prevent context contamination? (Separate message arrays)
• Research agent's tool calls appear in synthesis — what's wrong?
  (Context isolation violated — passed full history instead of final output)
• Which model for which agent? (Cheap for research, capable for synthesis)
• How to handle research agent timeout? (Graceful degradation)</div>

<h3>Scenario: Developer Productivity (CI Triage)</h3>
<div class="code-block">Setup: An agent that triages CI/CD build failures.

Typical questions test:
• Architecture: coordinator + log-fetcher + pattern-analyzer + fix-suggester
• Tool scoping: log reader has read-only, fix-suggester can write
• When single vs multi-agent? (Complexity of the pipeline)
• How to handle flaky tests vs real failures? (Classification step)</div>

<h3>Top Anti-Patterns (These ARE the Wrong Answers)</h3>

<div class="warning-point">⚠️ <strong>Anti-Pattern 1: Parsing text for control flow</strong>
<br>If a question describes an agent checking <code>if "done" in response.text</code> — that's ALWAYS wrong. Use stop_reason.</div>

<div class="warning-point">⚠️ <strong>Anti-Pattern 2: Relying on prompts for hard guarantees</strong>
<br>If a question asks "how to ENSURE X never happens?" and one option is "add it to the system prompt" — that option is wrong. Hard guarantees need code (hooks).</div>

<div class="warning-point">⚠️ <strong>Anti-Pattern 3: Sharing full conversation history between agents</strong>
<br>If a question describes context leaking between agents — the fix is always "pass only final outputs, keep message arrays separate."</div>

<div class="warning-point">⚠️ <strong>Anti-Pattern 4: Failing open on hook errors</strong>
<br>If a hook crashes and the system proceeds anyway — that's wrong. Hooks must fail CLOSED (block the action if you can't verify the policy).</div>

<div class="warning-point">⚠️ <strong>Anti-Pattern 5: One massive agent for everything</strong>
<br>If a scenario has 20+ tools and degrading quality — the fix is splitting into scoped subagents, not "adding more instructions to the prompt."</div>

<h3>Decision Framework for Exam Questions</h3>
<div class="code-block">When the exam asks "what's wrong?" look for:
1. Is stop_reason being checked? If not → that's the bug
2. Is a hard policy enforced only in prompt? → needs hook
3. Are subagent internals leaking? → needs context isolation
4. Is a hook failing open? → should fail closed
5. Is the agent retrying forever? → needs iteration limit

When the exam asks "best architecture?" think:
1. How many distinct tool scopes needed? → agents per scope
2. Does quality degrade with conversation length? → split + isolate
3. Can subtasks run independently? → parallel subagents
4. Is shared state heavy? → maybe keep as single agent
5. Different accuracy needs per subtask? → different models</div>

<div class="exam-tip">🎓 <strong>Strategy:</strong> In the exam, always eliminate the "prompt-only" option first when the question is about hard guarantees. Then look at whether context isolation is relevant. These two patterns cover ~60% of Domain 1 questions.</div>
`
        },
        // ===== CHAPTER 1 QUIZ =====
        {
          title: "Chapter 1 Exam — Agentic Architecture",
          type: "quiz",
          questions: [
            {
              q: "An agent receives stop_reason='tool_use'. What should the loop do?",
              options: ["Return the response to the user", "Execute the requested tool(s), append results to messages, and continue the loop", "Ask the user for permission", "Log the tool call and skip it"],
              correct: 1,
              explanation: "tool_use means Claude wants to call a tool. Execute it, append the tool_result (with matching tool_use_id), and loop again. Claude hasn't finished yet."
            },
            {
              q: "A bank requires that wire transfers over $10,000 get human approval. The system prompt says 'require approval for transfers over $10,000'. Is this sufficient?",
              options: ["Yes, Claude follows system prompts reliably", "No — financial compliance must be enforced in a PreToolUse hook (application code)", "Yes, if you also add it to the tool description", "No — it should be in the model's training data"],
              correct: 1,
              explanation: "Any rule that MUST hold (especially financial compliance) belongs in application-layer code. System prompts are guidance that can potentially be overridden. A PreToolUse hook provides a deterministic guarantee."
            },
            {
              q: "Your agent's hook throws an unhandled exception. What should happen?",
              options: ["Skip the hook and execute the tool", "Retry the hook 3 times", "BLOCK the tool call and log the error (fail closed)", "Return a generic success to Claude"],
              correct: 2,
              explanation: "Hooks must fail CLOSED. If you can't verify the policy (hook crashed), you cannot allow the action. Block it, log loudly, alert ops. Failing open is how policy silently evaporates."
            },
            {
              q: "In a coordinator-subagent system, the coordinator passes the full research agent conversation (including all tool calls) to the synthesis agent. What's wrong?",
              options: ["Nothing — more context is always better", "Context contamination — synthesis agent only needs the final research output, not internal tool calls", "The models will conflict", "It's too expensive but otherwise fine"],
              correct: 1,
              explanation: "Context isolation: each subagent's internal reasoning and tool calls should never leak to other agents. Pass only the final structured output. Full history causes contamination, bloat, and confused behavior."
            },
            {
              q: "An agent checks if response.content[0].text contains 'finished' to decide when to stop. What's the fundamental problem?",
              options: ["'finished' might be misspelled", "Should branch on stop_reason, never parse content text for control flow", "Should check all content blocks, not just [0]", "Needs case-insensitive matching"],
              correct: 1,
              explanation: "The cardinal rule: ALWAYS branch on stop_reason. Never parse text for control flow. 'finished' might appear mid-sentence, in tool results, or in quoted text. stop_reason is the authoritative signal."
            },
            {
              q: "When should you prefer a single agent over splitting into coordinator + subagents?",
              options: ["When you have more than 5 tools", "When subtasks share heavy state and splitting would force expensive serialization", "Always — single agents are always simpler", "When using the Agent SDK"],
              correct: 1,
              explanation: "If subtasks share heavy state, splitting forces you to serialize that state between agents (pass it back and forth), doubling context cost and adding latency. Keep it as one agent when the splitting overhead exceeds benefits."
            },
            {
              q: "What does settingSources: ['user', 'project'] do in the Agent SDK?",
              options: ["Loads API keys from two locations", "Loads CLAUDE.md instructions from both ~/.claude/CLAUDE.md and ./CLAUDE.md", "Configures two backup models", "Sets up user and project databases"],
              correct: 1,
              explanation: "settingSources tells the Agent SDK to load instructions from user-level (~/.claude/CLAUDE.md) and project-level (./CLAUDE.md). Both are merged, with project overriding user on conflicts."
            },
            {
              q: "The tool_result message must include which critical field to match with the tool_use request?",
              options: ["tool_name", "tool_use_id", "session_id", "request_id"],
              correct: 1,
              explanation: "Every tool_result must include tool_use_id matching the corresponding tool_use block's id. This is how Claude correlates which result belongs to which tool call, especially when multiple tools are called."
            },
            {
              q: "An agent has 18 tools. Users report it often calls the wrong tool. Best architectural fix?",
              options: ["Improve all 18 tool descriptions", "Add a triage step that determines the category, then only provide relevant tools (3-5) to the agent", "Switch to a larger model", "Add 'choose carefully' to the system prompt"],
              correct: 1,
              explanation: "With 18 tools, the model struggles to differentiate. A two-stage approach works better: first classify intent (3-4 categories), then provide only the relevant 3-5 tools. Reduces confusion and improves selection accuracy."
            },
            {
              q: "What's the difference between session 'resume' and session 'fork'?",
              options: ["Resume is faster, fork is slower", "Resume continues linearly; fork branches into a new independent conversation from a shared history point", "Resume uses the same model; fork can use different models", "They're the same thing with different names"],
              correct: 1,
              explanation: "Resume = continue the same conversation (linear). Fork = create a new branch from a point in history (parallel exploration). Fork is useful for trying multiple approaches independently."
            }
          ]
        }
      ]
    },
    // ============================================================
    // CHAPTER 2: Tool Design & MCP Integration (18%)
    // ============================================================
    {
      id: 2,
      title: "Tool Design & MCP Integration",
      weight: "18%",
      icon: "🔧",
      description: "Tool definitions that actually work, MCP servers & transports, tool_choice modes, caching, and structured errors.",
      sections: [
        {
          title: "2.1 — Tool Definitions: The Art of the Description",
          type: "lesson",
          content: `
<h2>📝 Writing Tools Claude Actually Uses Correctly</h2>
<p>The #1 reason agents call the wrong tool isn't a model bug — it's a bad tool description. Let's learn how to write descriptions that serve as unambiguous contracts.</p>

<h3>The Description is Everything</h3>
<p>Claude decides which tool to call based primarily on the <code>description</code> field. The name is just a label. Think of it like a job posting — Claude reads the description to decide if this tool is right for the task.</p>

<h3>The Five Questions Every Description Must Answer</h3>
<ol>
<li><strong>WHAT does this tool do?</strong> — "Searches the product knowledge base for documentation and support articles"</li>
<li><strong>WHEN should Claude use it?</strong> — "Use when the user asks about product features, troubleshooting, or company policies"</li>
<li><strong>WHEN should Claude NOT use it?</strong> — "Do NOT use for billing questions (use lookup_billing instead) or account changes"</li>
<li><strong>WHAT do the inputs mean?</strong> — "query: natural language search. Include product names or error codes when available"</li>
<li><strong>WHAT does the output look like?</strong> — "Returns top 5 articles with title, excerpt, and relevance score. Returns empty array if no matches."</li>
</ol>

<h3>Side-by-Side Comparison</h3>
<div class="code-block">// ❌ TERRIBLE — Claude has to guess everything
{
    "name": "search",
    "description": "Searches for things"
}

// ❌ BAD — Missing when/when-not and output shape
{
    "name": "search_kb",
    "description": "Searches the knowledge base"
}

// ✅ GOOD — Complete contract
{
    "name": "search_knowledge_base",
    "description": "Search the internal product knowledge base for documentation, "
        "support articles, and troubleshooting guides. "
        "USE when: user asks about product features, how-to questions, "
        "error messages, or company policies. "
        "DO NOT use for: billing inquiries (use lookup_billing), "
        "account modifications (use update_account), or order tracking "
        "(use track_order). "
        "Returns: Array of up to 5 matching articles, each with "
        "{title, excerpt, url, relevance_score}. "
        "Returns empty array [] if no relevant articles found."
}</div>

<h3>Overlapping Tools — The Common Trap</h3>
<p>When two tools have overlapping descriptions, Claude gets confused:</p>
<div class="code-block">// ❌ PROBLEM — these overlap!
Tool A: "Search for customer information"
Tool B: "Look up customer data"
// Claude can't tell the difference!

// ✅ FIXED — clear boundaries
Tool A: "Search for customers by name or email when you don't have their ID. "
        "Returns a list of matching customers. Use this for DISCOVERY."
Tool B: "Look up a specific customer's full profile by their customer ID (CUST-XXXXX). "
        "Requires exact ID. Use this for DETAIL after you have the ID."</div>

<div class="key-point">💡 <strong>The Litmus Test:</strong> If you removed the tool names and only showed descriptions to a person, could they tell the tools apart and know when to use each one? If not, your descriptions need work.</div>

<h3>Input Schema Best Practices</h3>
<div class="code-block">"input_schema": {
    "type": "object",
    "properties": {
        // Use descriptive names AND add description fields
        "customer_id": {
            "type": "string",
            "description": "Customer ID in format CUST-XXXXX. Get this from lookup_customer first."
        },
        // Use enums to constrain choices
        "refund_reason": {
            "type": "string",
            "enum": ["defective", "not_received", "wrong_item", "changed_mind"],
            "description": "Categorized reason. Ask the customer if unclear."
        },
        // Set reasonable constraints
        "amount_cents": {
            "type": "integer",
            "minimum": 1,
            "maximum": 50000,
            "description": "Amount in cents. Max $500 (50000 cents)."
        }
    },
    "required": ["customer_id", "refund_reason", "amount_cents"]
}</div>

<div class="exam-tip">🎓 <strong>Exam Pattern:</strong> "The agent keeps calling tool X when it should call tool Y." The answer is almost ALWAYS: improve tool descriptions (add when-NOT-to-use clauses), reduce overlap between descriptions, or scope tools to specific agents.</div>
`
        },
        {
          title: "2.2 — tool_choice: Controlling Tool Selection",
          type: "lesson",
          content: `
<h2>🎛️ The Four tool_choice Modes</h2>
<p>You can control HOW MUCH freedom Claude has in selecting tools. This is one of the most powerful control mechanisms in the API.</p>

<h3>Mode 1: auto (Default)</h3>
<div class="code-block">tool_choice = {"type": "auto"}

// Claude can:
// ✓ Call one or more tools
// ✓ Respond with text only (no tools)
// ✓ Mix text and tool calls in one response
//
// Use when: Normal agent operation. Claude decides if tools are needed.</div>

<h3>Mode 2: any — "You MUST call a tool"</h3>
<div class="code-block">tool_choice = {"type": "any"}

// Claude MUST:
// ✓ Call at least one tool (can't respond with text only)
//
// Claude can:
// ✓ Choose which tool to call
//
// Use when: You need guaranteed tool usage but don't care which tool.
// Example: A classification step where any classifier tool is acceptable.</div>

<h3>Mode 3: tool — "Call THIS specific tool"</h3>
<div class="code-block">tool_choice = {"type": "tool", "name": "extract_invoice"}

// Claude MUST:
// ✓ Call this specific tool
// ✓ Provide inputs matching the tool's schema
//
// Use when: STRUCTURED OUTPUT. This is the production pattern for
// getting guaranteed JSON in a specific schema from Claude.
//
// This is the most important mode for the exam!</div>

<div class="key-point">💡 <strong>The Forced Tool Call Pattern (CRITICAL for the exam):</strong>
<br>1. Define a tool whose input_schema = your desired output format
<br>2. Set tool_choice to force that specific tool
<br>3. Claude MUST respond with data matching that schema
<br>4. You validate with Pydantic and retry if needed
<br><br>
This is THE canonical way to get structured output from Claude in production.</div>

<h3>Mode 4: none — "No tools this turn"</h3>
<div class="code-block">tool_choice = {"type": "none"}

// Claude CANNOT:
// ✗ Call any tools
//
// Claude MUST:
// ✓ Respond with text only
//
// Use when: You want a pure text response (summary, explanation, confirmation)
// without the model taking any actions. Tools stay defined for future turns.</div>

<h3>Parallel vs Sequential Tool Use</h3>
<div class="code-block">// By default, Claude can call multiple tools in one response (parallel)
response.content = [
    ToolUseBlock(name="get_weather", input={"city": "Tokyo"}),
    ToolUseBlock(name="get_weather", input={"city": "London"})
]
// Both get executed, results sent back together

// To FORCE sequential (one at a time):
tool_choice = {
    "type": "auto",
    "disable_parallel_tool_use": True
}
// Now Claude can only request ONE tool per response
// Use when: Tool B depends on Tool A's result
// Example: Check balance THEN transfer (order matters)</div>

<h3>When to Use Which Mode — Decision Tree</h3>
<div class="code-block">What do you need?

"Claude should decide if tools are needed"
  → type: "auto" (default)

"Claude MUST use a tool but can pick which one"
  → type: "any"

"Claude MUST produce data in THIS specific schema"  
  → type: "tool" + name (forced structured output)

"Claude should just talk, no actions"
  → type: "none"

"Tool calls must happen one at a time (ordering matters)"
  → type: "auto" + disable_parallel_tool_use: true</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> The exam LOVES testing tool_choice. Key distinctions:
<br>• "any" = must call SOME tool (model picks which)
<br>• "tool" = must call THIS SPECIFIC tool (you pick which) — used for structured output
<br>• "none" = temporarily disables tools without removing definitions
<br>• disable_parallel_tool_use = sequential when ordering matters</div>
`
        },
        {
          title: "2.3 — MCP: The Universal Tool Protocol",
          type: "lesson",
          content: `
<h2>🌐 Model Context Protocol — The USB Port for AI</h2>
<p>MCP is an open standard that lets AI models connect to ANY external tool or data source through a unified interface. Instead of building custom integrations for every tool, you build one MCP server and any MCP-compatible client can use it.</p>

<h3>Why MCP Exists</h3>
<div class="code-block">Without MCP:
  Claude ──custom code──▶ Tool A
  Claude ──different code──▶ Tool B  
  Claude ──yet another──▶ Tool C
  // Every tool needs custom integration

With MCP:
  Claude ──MCP Client──▶ MCP Server A (standard protocol)
  Claude ──MCP Client──▶ MCP Server B (same protocol!)
  Claude ──MCP Client──▶ MCP Server C (same protocol!)
  // One protocol, unlimited tools</div>

<h3>MCP Architecture</h3>
<div class="code-block">┌────────────┐     ┌────────────┐     ┌────────────────┐
│   Claude   │────▶│ MCP Client │────▶│   MCP Server   │
│   (Model)  │◀────│ (Your App) │◀────│   (Tools/Data) │
└────────────┘     └────────────┘     └────────────────┘

The MCP Server exposes three types of capabilities:
  1. TOOLS    — Functions the model can call
  2. RESOURCES — Data the model can read  
  3. PROMPTS  — Reusable prompt templates</div>

<h3>The Three MCP Primitives</h3>

<p><strong>1. Tools</strong> — Actions the model can take</p>
<div class="code-block">@mcp.tool()
def search_docs(query: str, limit: int = 5) -> str:
    """Search documentation. Returns top matches with relevance scores."""
    results = database.search(query, limit=limit)
    return json.dumps(results)</div>

<p><strong>2. Resources</strong> — Data the model can read (read-only)</p>
<div class="code-block">@mcp.resource("config://app-settings")
def get_app_config() -> str:
    """Current application configuration and feature flags."""
    return json.dumps(load_config())</div>

<p><strong>3. Prompts</strong> — Reusable prompt templates</p>
<div class="code-block">@mcp.prompt("summarize")
def summarize_prompt(text: str, style: str = "bullets") -> str:
    """Generate a summarization prompt with specified style."""
    return f"Summarize in {style} format:\\n\\n{text}"</div>

<h3>The Three Transport Types</h3>
<p>MCP servers communicate via one of three transports:</p>

<p><strong>stdio — Local process (most common for development)</strong></p>
<div class="code-block">// Server runs as a local subprocess
// Communicates via stdin/stdout
// No network needed — fast, simple, secure
{
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/docs"],
            "env": {}
        }
    }
}
// Use when: Local tools, development, file system access</div>

<p><strong>SSE (Server-Sent Events) — Remote, streaming</strong></p>
<div class="code-block">// Server is remote, HTTP-based, streams responses
{
    "mcpServers": {
        "knowledge-base": {
            "type": "sse",
            "url": "https://mcp.company.com/sse",
            "headers": {
                "Authorization": "Bearer \${API_TOKEN}"
            }
        }
    }
}
// Use when: Remote servers that need streaming, long-running operations</div>

<p><strong>HTTP — Remote, request/response</strong></p>
<div class="code-block">// Standard HTTP request/response
{
    "mcpServers": {
        "api-gateway": {
            "type": "http",
            "url": "https://mcp.company.com/v1",
            "headers": {
                "X-API-Key": "\${MCP_API_KEY}"
            }
        }
    }
}
// Use when: Standard REST-like APIs, simple request/response</div>

<h3>Environment Variable Expansion</h3>
<div class="code-block">// NEVER put actual secrets in .mcp.json!
// Use \${ENV_VAR} — it expands at runtime from your environment

// ❌ BAD — secret in file (will be committed to git!)
"headers": {"Authorization": "Bearer sk-ant-abc123..."}

// ✅ GOOD — reference env var
"headers": {"Authorization": "Bearer \${ANTHROPIC_API_KEY}"}
// Actual value comes from: export ANTHROPIC_API_KEY=sk-ant-abc123...</div>

<div class="warning-point">⚠️ <strong>Security Rule:</strong> .mcp.json gets committed to source control. Secrets NEVER go in it. Always use \${ENV_VAR} expansion. If the env var isn't set, the server will fail to start with a clear error.</div>

<h3>Building an MCP Server (FastMCP)</h3>
<div class="code-block">from fastmcp import FastMCP

mcp = FastMCP("my-company-tools")

@mcp.tool()
def lookup_customer(customer_id: str) -> str:
    """Look up customer by ID. Returns name, plan, and status."""
    customer = db.get_customer(customer_id)
    return json.dumps(customer)

@mcp.tool()
def search_tickets(query: str, status: str = "open") -> str:
    """Search support tickets. Filter by status: open, closed, all."""
    tickets = db.search_tickets(query, status=status)
    return json.dumps(tickets)

@mcp.resource("docs://api-reference")
def api_docs() -> str:
    """Full API reference documentation."""
    return load_file("api-reference.md")

if __name__ == "__main__":
    mcp.run(transport="stdio")  # or "sse" for remote</div>

<div class="exam-tip">🎓 <strong>Exam Must-Knows:</strong>
<br>• Three primitives: Tools, Resources, Prompts
<br>• Three transports: stdio (local), SSE (remote streaming), HTTP (remote request/response)
<br>• \${ENV_VAR} for secrets — NEVER hardcode in config
<br>• .mcp.json is the config file for Claude Code
<br>• stdio = command + args, SSE/HTTP = type + url + headers</div>
`
        },
        {
          title: "2.4 — Prompt Caching for Tools",
          type: "lesson",
          content: `
<h2>💾 Save Money & Latency with Caching</h2>
<p>Every API call sends your tool definitions along with messages. If you have 10 tools, that's thousands of tokens repeated on EVERY call. Caching eliminates this waste.</p>

<h3>How Prompt Caching Works</h3>
<div class="code-block">Call 1: You send [system prompt + 10 tools + messages]
        Anthropic: "I'll cache this system prompt + tools for ~5 minutes"
        Response includes: cache_creation_input_tokens: 2500 (you WROTE to cache)

Call 2 (within 5 min): You send [same system prompt + same 10 tools + messages]  
        Anthropic: "I recognize this — reading from cache!"
        Response includes: cache_read_input_tokens: 2500 (you READ from cache)
        Cost: ~90% cheaper for those 2500 tokens!</div>

<h3>Setting Up Caching</h3>
<p>Mark the LAST item you want cached with <code>cache_control</code>:</p>

<div class="code-block">// Cache tool definitions:
tools = [
    {"name": "tool_1", "description": "...", "input_schema": {...}},
    {"name": "tool_2", "description": "...", "input_schema": {...}},
    {
        "name": "tool_3",
        "description": "...",
        "input_schema": {...},
        "cache_control": {"type": "ephemeral"}  // ← Cache marker on LAST tool
    }
]
// Everything up to and including this marker gets cached

// Cache system prompt:
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    system=[{
        "type": "text",
        "text": "You are a support agent. [2KB of policy rules...]",
        "cache_control": {"type": "ephemeral"}  // ← Cache this too
    }],
    tools=tools,
    messages=messages
)</div>

<h3>Verifying Cache Hits</h3>
<div class="code-block">// Call 1 — Cache WRITE
response1 = client.messages.create(...)
print(response1.usage.cache_creation_input_tokens)  // > 0 (wrote to cache)
print(response1.usage.cache_read_input_tokens)      // 0 (nothing to read yet)

// Call 2 — Cache READ (within ~5 minutes)
response2 = client.messages.create(...)  // Same tools, same system
print(response2.usage.cache_creation_input_tokens)  // 0 (already cached)
print(response2.usage.cache_read_input_tokens)      // > 0 (reading from cache!)</div>

<h3>Cache Invalidation</h3>
<p>Cache breaks if:</p>
<ul>
<li>Any cached content changes (even one character)</li>
<li>~5 minutes TTL expires (ephemeral)</li>
<li>You use a different model</li>
</ul>

<h3>What to Cache (and What Not To)</h3>
<div class="code-block">✅ Cache these (they rarely change between calls):
  • Tool definitions (they're the same every call)
  • System prompt with policy rules
  • Large context documents (case facts, product docs)
  • Few-shot examples

❌ Don't bother caching:
  • Messages (they change every turn)
  • Small inputs (< 1024 tokens — not worth it)
  • Things that change frequently</div>

<div class="key-point">💡 <strong>Cost Math:</strong> Cache reads are ~90% cheaper than processing those tokens fresh. If you have 3000 tokens of tools sent 100 times, caching saves ~270,000 tokens worth of cost. For high-volume agents, this adds up fast.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "How do you verify caching works?" → Check cache_creation_input_tokens on call 1 (should be > 0) and cache_read_input_tokens on call 2 (should be > 0). If both are 0, your cache_control isn't set up correctly or the content changed.</div>
`
        },
        {
          title: "2.5 — MCP Configuration Deep Dive",
          type: "lesson",
          content: `
<h2>⚙️ .mcp.json — Complete Configuration Guide</h2>
<p>Claude Code uses <code>.mcp.json</code> at the project root to configure MCP servers. Let's understand every aspect of this file.</p>

<h3>Full Configuration Example</h3>
<div class="code-block">{
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"],
            "env": {}
        },
        "github": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-github"],
            "env": {
                "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
            }
        },
        "company-api": {
            "type": "http",
            "url": "https://mcp.mycompany.com/v1",
            "headers": {
                "Authorization": "Bearer \${COMPANY_API_KEY}",
                "X-Team": "engineering"
            }
        },
        "analytics": {
            "type": "sse",
            "url": "https://analytics.mycompany.com/mcp/sse",
            "headers": {
                "Authorization": "Bearer \${ANALYTICS_TOKEN}"
            }
        }
    }
}</div>

<h3>Config Location Hierarchy</h3>
<div class="code-block">Project level: ./.mcp.json (in repo root)
  → Team tools, checked into git
  → \${ENV_VAR} for secrets

User level: ~/.claude.json (global)
  → Personal tools available across all projects
  → Your private servers</div>

<h3>Transport Quick Reference</h3>
<table style="width:100%; border-collapse: collapse; margin: 16px 0;">
<tr style="border-bottom: 1px solid var(--border); background: rgba(108,99,255,0.05);">
<td style="padding: 8px; font-weight: bold;">Transport</td>
<td style="padding: 8px; font-weight: bold;">Config Keys</td>
<td style="padding: 8px; font-weight: bold;">Use Case</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px;">stdio</td>
<td style="padding: 8px;">command, args, env</td>
<td style="padding: 8px;">Local tools, file access, dev tools</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px;">SSE</td>
<td style="padding: 8px;">type: "sse", url, headers</td>
<td style="padding: 8px;">Remote servers, streaming, long ops</td>
</tr>
<tr style="border-bottom: 1px solid var(--border);">
<td style="padding: 8px;">HTTP</td>
<td style="padding: 8px;">type: "http", url, headers</td>
<td style="padding: 8px;">Standard REST APIs, simple req/resp</td>
</tr>
</table>

<h3>Common Troubleshooting</h3>
<div class="code-block">Problem: Server fails to start
  → Check: Is the env var actually set? (echo \$ENV_VAR)
  → Check: Is the command installed? (npx, python, etc.)
  → Check: Are args correct?

Problem: 404 error on SSE/HTTP server
  → Means: URL is wrong or nothing is listening there
  → The error looks like: "Unexpected token < ... not valid JSON"
  → This is an HTML error page where JSON was expected

Problem: "Permission denied" on stdio server  
  → Check: Is the binary executable?
  → Check: File permissions on the script</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> The exam will show you a .mcp.json config and ask what's wrong, or describe a scenario and ask which transport to use. Remember: stdio = local (command), SSE = remote streaming (type + url), HTTP = remote simple (type + url). Secrets always via \${ENV_VAR}.</div>
`
        },
        {
          title: "Chapter 2 Exam — Tool Design & MCP",
          type: "quiz",
          questions: [
            {
              q: "A tool description says 'Searches the database'. The agent keeps calling it for completely unrelated queries. What's the fix?",
              options: ["Rename the tool to something more specific", "Add when-to-use AND when-NOT-to-use clauses to the description", "Remove the tool entirely", "Lower the temperature"],
              correct: 1,
              explanation: "Vague descriptions attract calls in ambiguous situations. Add explicit boundaries: WHEN to use this tool AND WHEN NOT to use it (with alternatives). The description is the contract."
            },
            {
              q: "You need Claude to always output data matching a specific JSON schema. What's the correct approach?",
              options: ["Ask nicely in the system prompt to return JSON", "Define a tool with the schema as input_schema, then set tool_choice: {type: 'tool', name: '...'}", "Set temperature to 0", "Use stop_sequences to detect JSON brackets"],
              correct: 1,
              explanation: "The forced tool call pattern: define a tool whose input_schema IS your desired output schema, then force Claude to call it. This guarantees schema-conforming output. Prompt-only approaches have no enforcement."
            },
            {
              q: "Your MCP server runs locally and communicates via stdin/stdout. What transport is this?",
              options: ["HTTP", "SSE", "stdio", "WebSocket"],
              correct: 2,
              explanation: "stdio transport runs a local process, communicating via standard input/output. Configured with 'command' and 'args' in .mcp.json. No network needed — just a subprocess."
            },
            {
              q: "cache_read_input_tokens is 0 on your second API call (made within 2 minutes). Most likely cause?",
              options: ["The cache expired", "The cached content changed between calls (invalidating the cache) or cache_control wasn't set correctly", "The model doesn't support caching", "Need to wait longer between calls"],
              correct: 1,
              explanation: "If cache_read is 0 shortly after a write, either: the cached content changed (any modification invalidates), or cache_control wasn't on the right block. Verify nothing changed between calls."
            },
            {
              q: "You want Claude to call tools one-at-a-time because Tool B depends on Tool A's output. What do you set?",
              options: ["tool_choice: {type: 'tool', name: 'A'} then tool_choice: {type: 'tool', name: 'B'}", "tool_choice: {type: 'auto', disable_parallel_tool_use: true}", "tools: [only_tool_A]", "max_tokens: 100 to force single calls"],
              correct: 1,
              explanation: "disable_parallel_tool_use: true forces sequential tool calls. Claude can only request one tool per response, ensuring B can't be called until A's result is back. Pair with clear descriptions about dependencies."
            },
            {
              q: "Where should auth tokens for an MCP server go?",
              options: ["Directly in .mcp.json headers", "In environment variables referenced via \\${ENV_VAR} in the config", "In CLAUDE.md", "In the tool description"],
              correct: 1,
              explanation: "\\${ENV_VAR} expansion in .mcp.json keeps secrets out of source control. The config file is committed to git; actual secret values live in environment variables."
            },
            {
              q: "What are the three MCP server primitives?",
              options: ["Read, Write, Execute", "Tools, Resources, Prompts", "Input, Output, Config", "Agents, Tasks, Hooks"],
              correct: 1,
              explanation: "MCP servers expose three primitives: Tools (callable functions), Resources (readable data), and Prompts (reusable prompt templates). Each serves a different purpose."
            },
            {
              q: "A tool returns the string 'Error: timeout'. What should it return instead?",
              options: ["Nothing", "A structured error: {isError: true, errorCategory: 'transient', isRetryable: true, message: '...'}", "An HTTP status code", "The word 'RETRY'"],
              correct: 1,
              explanation: "Structured errors tell Claude exactly what happened and what to do. errorCategory (transient/permanent/policy) + isRetryable give clear decision signals. Bare strings force the model to guess."
            },
            {
              q: "tool_choice: {type: 'any'} means what?",
              options: ["Claude can use any tool or respond with text", "Claude MUST call at least one tool but can pick which one", "All tools are available", "Claude should use every tool"],
              correct: 1,
              explanation: "type: 'any' = Claude must call SOME tool (can't respond with text only) but can choose which. Use for classification or guaranteed structured output when multiple tools are acceptable."
            },
            {
              q: "Which tool_choice mode temporarily disables tools without removing their definitions?",
              options: ["auto", "any", "none", "tool"],
              correct: 2,
              explanation: "type: 'none' disables tool use for this turn while keeping tools defined for future turns. Useful for getting a text-only summary or explanation without the model taking action."
            }
          ]
        }
      ]
    },
    // ============================================================
    // CHAPTER 3: Claude Code Configuration & Workflows (20%)
    // ============================================================
    {
      id: 3,
      title: "Claude Code Configuration & Workflows",
      weight: "20%",
      icon: "💻",
      description: "CLAUDE.md hierarchy, permissions, plan mode, slash commands, agent skills, and CI/CD automation with claude -p.",
      sections: [
        {
          title: "3.1 — CLAUDE.md: The Four-Tier Instruction Hierarchy",
          type: "lesson",
          content: `
<h2>📋 How Claude Code Gets Its Instructions</h2>
<p>Claude Code reads instructions from CLAUDE.md files at four different levels. These stack on top of each other, with more specific levels overriding general ones.</p>

<h3>The Hierarchy (Most General → Most Specific)</h3>
<div class="code-block">Priority 1 (lowest): ~/.claude/CLAUDE.md
  → YOUR personal defaults, applied to EVERY project
  → "I prefer tabs over spaces", "Always use TypeScript"
  → Everyone has different personal preferences

Priority 2: ./CLAUDE.md (project root)
  → TEAM conventions, committed to git
  → "We use Python 3.12, FastAPI, PostgreSQL"
  → "All functions must have type hints"
  → Shared by everyone on the team

Priority 3: subdirectory/CLAUDE.md  
  → SCOPED rules for a specific part of the codebase
  → frontend/CLAUDE.md: "Use React hooks, Tailwind CSS"
  → backend/CLAUDE.md: "Use repository pattern, no raw SQL"
  → Only loads when Claude reads files in that directory!

Priority 4 (highest): CLAUDE.local.md
  → YOUR personal overrides for THIS specific repo
  → Gitignored — never committed, never shared
  → "My local API endpoint is localhost:3000"</div>

<h3>What Goes Where — Complete Guide</h3>

<p><strong>~/.claude/CLAUDE.md (User Level)</strong></p>
<div class="code-block"># My Personal Preferences

## Coding Style
- Use descriptive variable names (no single letters except loop counters)
- Prefer early returns over nested if/else
- Maximum line length: 100 characters

## Communication
- Be concise in explanations
- Show code examples, not just descriptions
- Always explain the "why" not just the "what"</div>

<p><strong>./CLAUDE.md (Project Level) — THE most important file</strong></p>
<div class="code-block"># Project: Customer Support Platform

## Tech Stack
- Backend: Python 3.12, FastAPI, SQLAlchemy, PostgreSQL
- Frontend: React 18, TypeScript, Tailwind CSS
- Testing: pytest (backend), Vitest (frontend)
- CI: GitHub Actions

## Architecture
- Domain-driven design with bounded contexts
- Repository pattern for all database access  
- Event-driven communication between domains
- API versioning via URL prefix (/v1/, /v2/)

## Coding Standards
- All functions must have type hints and docstrings
- No bare except clauses — always catch specific exceptions
- All API endpoints must have OpenAPI documentation
- Database migrations via Alembic — never modify DB directly

## Testing Requirements
- All new code must have unit tests
- Integration tests for API endpoints
- Min 80% coverage on new code
- No mocking of the thing being tested

## Forbidden Patterns
- No global mutable state
- No circular imports between domains
- No raw SQL queries (use SQLAlchemy ORM)
- No dependencies added without team approval</div>

<p><strong>frontend/CLAUDE.md (Subtree Level)</strong></p>
<div class="code-block"># Frontend Conventions

## Component Rules
- Functional components only (no class components)
- All components must be accessible (ARIA labels, keyboard nav)
- Use React Query for server state, Zustand for client state
- Components > 100 lines should be split

## Styling
- Tailwind utility classes only — no custom CSS files
- Never use inline styles
- Dark mode support required on all new components

## File Structure
- One component per file
- Co-locate tests: Button.tsx → Button.test.tsx
- Shared hooks in hooks/ directory</div>

<div class="key-point">💡 <strong>Critical Insight:</strong> Subtree CLAUDE.md files ONLY load when Claude reads files in that directory. If you're working on backend code, frontend/CLAUDE.md doesn't load — it doesn't waste context or cause conflicting rules.</div>

<h3>Path-Specific Rules (.claude/rules/)</h3>
<p>For even finer control, use rules with glob patterns:</p>
<div class="code-block"># .claude/rules/api-endpoints.md
---
paths: ["src/api/**/*.py", "src/routes/**/*.py"]
---

All API endpoints must:
1. Have @router.get/post/put/delete decorator
2. Include response_model in the decorator
3. Have a docstring that becomes the OpenAPI description
4. Validate input with Pydantic models
5. Return consistent error format: {"error": str, "code": str}</div>

<div class="code-block"># .claude/rules/database.md
---
paths: ["src/models/**", "src/repositories/**", "migrations/**"]
---

Database rules:
1. All models inherit from Base (declarative_base)
2. All tables must have created_at and updated_at columns
3. Use UUID primary keys, never auto-increment integers
4. Foreign keys must have explicit ondelete behavior
5. Indexes on all frequently-queried columns</div>

<div class="exam-tip">🎓 <strong>Exam Pattern:</strong> "Where should X go?"
<br>• Team coding standards → Project ./CLAUDE.md
<br>• Personal preferences → User ~/.claude/CLAUDE.md
<br>• Frontend-only rules → frontend/CLAUDE.md (subtree)
<br>• My local API paths → CLAUDE.local.md (gitignored)
<br>• Rules for specific file types → .claude/rules/ with paths globs</div>
`
        },
        {
          title: "3.2 — Claude Code CLI: Interactive & Headless",
          type: "lesson",
          content: `
<h2>🚀 Two Modes: Interactive & Headless (claude -p)</h2>
<p>Claude Code works in two modes: interactive (you chat with it) and headless (it runs as a script). The headless mode is your bridge to CI/CD.</p>

<h3>Interactive Mode (Normal Usage)</h3>
<div class="code-block"># Just launch Claude Code
claude

# Now you can chat, use slash commands, etc.
> What does the auth module do?
> /compact  (compress history)
> /model sonnet  (switch model)
> /clear  (clear conversation)</div>

<h3>Plan Mode (Shift+Tab)</h3>
<p>Cycle between modes with Shift+Tab:</p>
<ul>
<li><strong>Normal mode</strong> — Claude reads AND writes files. Full power.</li>
<li><strong>Plan mode</strong> — Claude analyzes and plans but makes NO file changes. Read-only exploration.</li>
</ul>

<div class="key-point">💡 <strong>When to use Plan mode:</strong> Before making big changes. "What would you change to add authentication?" — Claude explains without touching files. Once you're happy with the plan, switch back to normal mode to execute.</div>

<h3>Headless Mode: claude -p</h3>
<p>This is the big one for the exam. <code>claude -p</code> runs Claude Code non-interactively — perfect for scripts and CI/CD:</p>

<div class="code-block"># Basic headless usage
claude -p "List all Python files missing docstrings"

# JSON output for machine parsing
claude -p "Analyze for security issues" --output-format json

# Pipe input
cat error.log | claude -p "Summarize these errors"

# Use specific model
claude -p "Review this code" --model claude-sonnet-4-20250514

# Non-zero exit code on failure
claude -p "Run tests and report" || echo "Issues found"</div>

<h3>CI/CD Integration Examples</h3>
<div class="code-block"># GitHub Actions — PR Review
name: Claude PR Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Review PR
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "Review this PR diff for:
            1. Security vulnerabilities
            2. Performance issues  
            3. Missing error handling
            4. Breaking API changes
            Format as JSON." --output-format json > review.json</div>

<div class="code-block"># Migration generation
claude -p "Generate a database migration to add 'email_verified' boolean column to the users table. Use Alembic format."

# Documentation updates
claude -p "Update the API documentation in docs/api.md to reflect the changes in src/routes/"

# Test generation
claude -p "Write unit tests for src/services/payment.py covering edge cases"</div>

<h3>Slash Commands & Agent Skills</h3>
<p>Custom commands defined in <code>.claude/commands/</code>:</p>
<div class="code-block"># .claude/commands/review.md
Review the current file for:
1. Security issues (injection, XSS, auth bypass)
2. Performance (N+1 queries, unnecessary allocations)
3. Error handling (bare excepts, silent failures)
4. Missing tests for critical paths

Output a numbered list with severity: HIGH / MEDIUM / LOW

# Usage in Claude Code:
> /review</div>

<div class="code-block"># .claude/commands/migrate.md
Generate an Alembic migration for the described schema change.
Follow these rules:
- Always include both upgrade() and downgrade()
- Add indexes for foreign keys
- Use batch mode for SQLite compatibility
- Include a descriptive revision message

# Usage:
> /migrate add email_verified to users table</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> 
<br>• "How to automate Claude Code in CI/CD?" → claude -p with --output-format json
<br>• "How to explore without changing files?" → Plan mode (Shift+Tab)
<br>• "How to add custom commands?" → .claude/commands/*.md files
<br>• "How to compress long conversations?" → /compact slash command</div>
`
        },
        {
          title: "3.3 — Permissions & Security Model",
          type: "lesson",
          content: `
<h2>🔐 Controlling What Claude Code Can Do</h2>
<p>Claude Code has a permission system that gates which tools it can use. Understanding this is critical for security-focused exam questions.</p>

<h3>Permission Levels</h3>
<div class="code-block">Ask          → Prompt user for approval every time (default for writes)
Allow        → Auto-approve for this session only
Always Allow → Auto-approve permanently (saved to settings)
Deny         → Block this tool entirely, no exceptions</div>

<h3>Tool Categories</h3>
<div class="code-block">Read tools:   file_read, grep, find, list_directory
Write tools:  file_write, file_edit, create_directory, delete_file
Shell tools:  bash, execute_command
Web tools:    web_search, web_fetch
MCP tools:    Any tools from configured MCP servers</div>

<h3>Defense in Depth — The Full Stack</h3>
<div class="code-block">Layer 1: CLAUDE.md instructions
    "Don't modify files in /config/production/"
    → Weakest. Guidance only. Can be overridden.

Layer 2: Tool descriptions  
    "This tool modifies production config. Use with extreme caution."
    → Moderate. Claude respects this but isn't bound by it.

Layer 3: Claude Code permissions
    Deny: shell commands matching "rm -rf /"
    → Strong. Claude Code enforces this.

Layer 4: Hooks (PreToolUse)
    Check all write operations against an allowlist
    → Deterministic. Code-level gate.

Layer 5: OS/Network controls
    File permissions, network ACLs, container sandboxing
    → Final backstop. Even if everything else fails.</div>

<div class="key-point">💡 <strong>The Layering Principle:</strong> Each layer catches what the one above missed. A security-critical system uses ALL layers. The exam tests whether you know which layer is appropriate for which type of guarantee.</div>

<h3>Decision Framework</h3>
<div class="code-block">Consequence of violation → Enforcement layer:

"Code style issue"           → CLAUDE.md (layer 1)
"Wrong API pattern"          → Tool description (layer 2)
"Modifying wrong files"      → Permissions (layer 3)
"Processing unauthorized tx" → Hook (layer 4)
"Accessing prod database"    → Network controls (layer 5)</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> When asked "which layer for X?", match consequence to depth. Low consequence = shallow layer (prompt). High consequence = deep layer (hook/code). The exam never accepts "system prompt" as the answer for financial, security, or compliance guarantees.</div>
`
        },
        {
          title: "Chapter 3 Exam — Claude Code & Workflows",
          type: "quiz",
          questions: [
            {
              q: "Your team wants all engineers using Claude Code to follow the same coding standards. Where do these standards go?",
              options: ["~/.claude/CLAUDE.md (user level)", "./CLAUDE.md at the repo root (project level, committed to git)", "CLAUDE.local.md", "Each engineer's system prompt"],
              correct: 1,
              explanation: "Team standards go in project-level ./CLAUDE.md, committed to git so everyone shares them. User-level is personal; CLAUDE.local.md is gitignored."
            },
            {
              q: "Claude Code keeps applying backend patterns when editing frontend files. How do you fix this?",
              options: ["Add more detail to root CLAUDE.md", "Create subtree files: frontend/CLAUDE.md and backend/CLAUDE.md with scoped rules", "Use CLAUDE.local.md", "Remove backend rules from CLAUDE.md"],
              correct: 1,
              explanation: "Subtree CLAUDE.md files only load when working in that directory. frontend/CLAUDE.md rules won't apply to backend files and vice versa — clean separation."
            },
            {
              q: "You want to run Claude Code in a CI pipeline to review PRs. What command?",
              options: ["claude --review --ci", "claude -p 'review this PR' --output-format json", "claude /review", "claude --headless review"],
              correct: 1,
              explanation: "claude -p is headless/non-interactive mode for CI/CD. --output-format json gives machine-parseable output. This is the standard CI integration pattern."
            },
            {
              q: "What does Plan mode (Shift+Tab) do in Claude Code?",
              options: ["Creates a project plan document", "Claude analyzes and plans without making any file changes (read-only)", "Plans the CI/CD pipeline", "Opens a task management view"],
              correct: 1,
              explanation: "Plan mode = read-only exploration. Claude can analyze, reason, and propose changes without writing files. Switch back to normal mode to execute the plan."
            },
            {
              q: "Where do custom slash commands (Agent Skills) go?",
              options: [".claude/commands/*.md", "CLAUDE.md", ".mcp.json", ".claude/rules/*.md"],
              correct: 0,
              explanation: "Custom slash commands go in .claude/commands/ directory. Each .md file becomes a slash command (filename = command name). .claude/rules/ is for path-specific rules."
            },
            {
              q: "Project CLAUDE.md says 'use spaces'. User ~/.claude/CLAUDE.md says 'use tabs'. Which wins in this project?",
              options: ["User level always wins", "Project level overrides user level (spaces)", "They conflict and Claude asks", "Last one loaded wins"],
              correct: 1,
              explanation: "Project-level overrides user-level where they conflict. Project = team conventions. User = personal defaults. Within a project, team rules win."
            },
            {
              q: "A developer needs personal settings for this repo that shouldn't be shared. Where?",
              options: ["Project CLAUDE.md", "~/.claude/CLAUDE.md", "CLAUDE.local.md (gitignored)", "Subtree CLAUDE.md"],
              correct: 2,
              explanation: "CLAUDE.local.md is gitignored — personal repo-specific overrides. Won't be committed or shared with the team."
            },
            {
              q: "What's the correct enforcement layer for 'never delete production database tables'?",
              options: ["CLAUDE.md instruction", "Tool description", "PreToolUse hook that blocks destructive SQL on production", "Temperature setting"],
              correct: 2,
              explanation: "Data deletion is irreversible with catastrophic consequences. This needs a code-level gate (hook) that deterministically blocks the action. Prompts and descriptions are suggestions."
            }
          ]
        }
      ]
    },
    // ============================================================
    // CHAPTER 4: Prompt Engineering & Structured Output (20%)
    // ============================================================
    {
      id: 4,
      title: "Prompt Engineering & Structured Output",
      weight: "20%",
      icon: "✍️",
      description: "Write prompts that work reliably. Few-shot examples, forced tool calls, Pydantic validation, confidence routing.",
      sections: [
        {
          title: "4.1 — Writing Precise Prompts",
          type: "lesson",
          content: `
<h2>✍️ From "Be Helpful" to Actually Useful Prompts</h2>
<p>The difference between a prompt that works 60% of the time and one that works 99% of the time is SPECIFICITY. Claude picks reasonable defaults — but reasonable isn't YOUR default.</p>

<h3>The Vague → Precise Spectrum</h3>
<div class="code-block">Level 0 (useless): "Be accurate"
Level 1 (vague):   "Extract invoice data and return JSON"
Level 2 (better):  "Extract invoice_number, vendor, total, date as JSON"
Level 3 (good):    "Extract these fields with these types and these rules..."
Level 4 (precise): Full spec with edge cases, missing-data behavior, examples</div>

<h3>The Five Rules of Precise Prompts</h3>
<p><strong>Rule 1: Specify exact format</strong></p>
<div class="code-block">// ❌ "Return the data as JSON"
// ✅ "Return a JSON object with exactly these keys:
//     invoice_number (string), vendor (string), 
//     total_cents (integer), date (string, ISO 8601 YYYY-MM-DD)"</div>

<p><strong>Rule 2: Handle edge cases explicitly</strong></p>
<div class="code-block">// ❌ (no mention of edge cases)
// ✅ "If a field is illegible: set to null, add note to warnings array.
//     If multiple invoices on one page: extract ONLY the first one.
//     If the document is not an invoice: return {error: 'not_an_invoice'}"</div>

<p><strong>Rule 3: Define missing-data behavior</strong></p>
<div class="code-block">// ❌ (Claude guesses what to do with missing data)
// ✅ "For optional fields that are not present in the document:
//     - Set to null (not empty string, not 'N/A', not 'unknown')
//     - Do NOT invent or hallucinate values
//     - Do NOT infer from other fields unless explicitly stated"</div>

<p><strong>Rule 4: Set boundaries</strong></p>
<div class="code-block">// ❌ "Summarize this document"
// ✅ "Summarize in exactly 3 bullet points, each max 20 words.
//     First bullet: main conclusion
//     Second bullet: key evidence  
//     Third bullet: limitation or caveat"</div>

<p><strong>Rule 5: Give acceptance criteria</strong></p>
<div class="code-block">// ❌ "Make sure it's correct"
// ✅ "A valid extraction meets ALL of these criteria:
//     - All required fields present and non-null
//     - Dates in ISO 8601 (YYYY-MM-DD)
//     - Amounts in cents (integer, no decimals)
//     - invoice_number preserved exactly as printed (keep hyphens, leading zeros)
//     - No fields contain hallucinated/invented data"</div>

<h3>System Prompt Structure Template</h3>
<div class="code-block">system = """You are a [ROLE].

## Your Task
[One sentence describing what you do]

## Rules (follow ALL of these)
1. [Most important rule first — model attends to beginning]
2. [Second most important]
3. [...]

## Output Format
[Exact structure expected]

## Edge Cases
- If [scenario A]: do [specific action]
- If [scenario B]: do [different action]
- If uncertain: [what to do when unsure]

## Do NOT
- [Forbidden behavior 1]
- [Forbidden behavior 2]
"""</div>

<div class="key-point">💡 <strong>Attention Pattern:</strong> The model pays MOST attention to the beginning and end of the prompt. Put your most critical rules FIRST. Don't bury important instructions in the middle of a long prompt — they'll get weaker attention.</div>

<div class="warning-point">⚠️ <strong>Anti-Patterns to Avoid:</strong>
<br>• "Be accurate" — Not actionable. Replace with specific criteria.
<br>• "Try your best" — Means nothing to a model.
<br>• "Be careful" — Replace with explicit checks to perform.
<br>• "Use common sense" — Models don't have common sense. Be explicit.</div>

<div class="exam-tip">🎓 <strong>Exam Pattern:</strong> The exam shows a failing prompt and asks "what's wrong?" Look for: missing edge case handling, no format spec, vague words like "be helpful", no missing-data behavior, or important rules buried in the middle.</div>
`
        },
        {
          title: "4.2 — Few-Shot Examples: The Behavior Lock",
          type: "lesson",
          content: `
<h2>📝 When Prose Instructions Aren't Enough, Show Don't Tell</h2>
<p>Some behaviors are nearly impossible to describe in words but trivial to demonstrate. That's where few-shot examples come in — they're the strongest behavior-locking mechanism available.</p>

<h3>When to Use Few-Shot</h3>
<ul>
<li><strong>Regional formats</strong> — DD/MM/YYYY vs MM/DD/YYYY, decimal commas (1.234,56€)</li>
<li><strong>Domain jargon</strong> — Industry-specific abbreviations or terminology</li>
<li><strong>Exact output style</strong> — Tone, structure, level of detail</li>
<li><strong>Corner cases</strong> — How to handle ambiguous or missing data</li>
<li><strong>Anything you've tried to describe in words and Claude still gets wrong</strong></li>
</ul>

<h3>The Implementation Pattern</h3>
<p>Few-shot examples go in the messages array as fake user/assistant exchanges:</p>
<div class="code-block">messages = [
    // Example 1: European format (shows decimal comma handling)
    {
        "role": "user",
        "content": "Extract: Rechnung Nr. 2024-0891, Betrag: 1.234,56€, Datum: 15.03.2024"
    },
    {
        "role": "assistant",
        "content": [{"type": "tool_use", "id": "ex1", "name": "extract_invoice", 
            "input": {
                "invoice_number": "2024-0891",
                "total_cents": 123456,
                "currency": "EUR",
                "date": "2024-03-15",
                "warnings": []
            }}]
    },
    {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "ex1", "content": "OK"}]},
    
    // Example 2: Ambiguous/missing data (shows null + warning behavior)
    {
        "role": "user",
        "content": "Extract: INV-77, Amount: [illegible], Date: Jan 2024"
    },
    {
        "role": "assistant",
        "content": [{"type": "tool_use", "id": "ex2", "name": "extract_invoice",
            "input": {
                "invoice_number": "INV-77",
                "total_cents": null,
                "currency": null,
                "date": null,
                "warnings": ["Amount illegible", "Date incomplete - only month/year, no day"]
            }}]
    },
    {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "ex2", "content": "OK"}]},
    
    // ACTUAL REQUEST (Claude follows the pattern established above)
    {
        "role": "user", 
        "content": "Extract: Facture N° 2024/456, Montant: 2.890,00€, Date: 28/02/2024"
    }
]</div>

<h3>Why This Works So Well</h3>
<div class="key-point">💡 Few-shot examples in the message history are MUCH stronger than examples in the system prompt because:
<br>1. They use the EXACT same format as real interactions (tool_use blocks!)
<br>2. The model treats them as "this is how I've been behaving" not "this is how I should behave"
<br>3. They establish a pattern the model naturally continues
<br>4. They handle ambiguity better than any prose description</div>

<h3>How Many Examples?</h3>
<div class="code-block">2-3 examples: Usually enough for format/style locking
5-6 examples: Complex extraction with many edge cases  
8+ examples:  Diminishing returns — burning context for minimal gain

Rule: Start with 2. If Claude still gets the edge case wrong, add one more 
example showing EXACTLY that edge case. Repeat until stable.</div>

<h3>Common Use Case: The Model Normalizes When You Don't Want It To</h3>
<div class="code-block">Problem: System prompt says "preserve source date format"
         But Claude keeps converting "28/02/2024" → "2024-02-28" (normalizing)

Fix: Add a few-shot example showing the INPUT has "28/02/2024" 
     and the OUTPUT has "28/02/2024" (preserved as-is)
     
One example of this behavior locks it. The prose instruction alone wasn't enough.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "Claude keeps doing X despite instructions saying not to." The answer is almost always: add few-shot examples showing the correct behavior. Few-shot locks corner cases that prose alone cannot reach. This is a high-frequency exam pattern.</div>
`
        },
        {
          title: "4.3 — The Structured Output Pattern (Most Important!)",
          type: "lesson",
          content: `
<h2>📊 Guaranteed JSON Output — The Production Pattern</h2>
<p>This is arguably the most important practical pattern in the entire exam. It's how you get RELIABLE structured data from Claude in production.</p>

<h3>The Problem</h3>
<div class="code-block">// If you just ask Claude for JSON in the prompt:
"Please return a JSON object with name, age, and email"

// You might get:
// ✓ {"name": "Alice", "age": 30, "email": "alice@example.com"}  (great!)
// ✗ "Here's the JSON: {"name": "Alice"..."  (text + JSON mixed)
// ✗ {"Name": "Alice", "Age": "thirty"...}  (wrong keys, wrong types)
// ✗ "I don't have enough information to..."  (no JSON at all)

// Prompt-only approaches are unreliable for production!</div>

<h3>The Solution: Forced Tool Call + Pydantic + Retry</h3>
<p>Five steps to guaranteed structured output:</p>

<div class="code-block">from pydantic import BaseModel, Field
from typing import Optional
import json

# STEP 1: Define your desired output as a Pydantic model
class CustomerProfile(BaseModel):
    name: str = Field(description="Full name as it appears in the record")
    email: str = Field(description="Primary email address")
    plan: str = Field(description="Current subscription plan name")
    monthly_spend_cents: int = Field(description="Monthly spend in cents")
    active: bool = Field(description="Whether the account is currently active")
    notes: Optional[str] = Field(None, description="Any relevant notes, or null")

# STEP 2: Convert to JSON Schema (Pydantic does this automatically!)
schema = CustomerProfile.model_json_schema()
# This produces a valid JSON Schema that defines the structure

# STEP 3: Register as a tool
extract_tool = {
    "name": "output_customer_profile",
    "description": "Output the extracted customer profile data.",
    "input_schema": schema
}

# STEP 4: Force Claude to call this specific tool
MAX_RETRIES = 2

def extract_profile(raw_text):
    messages = [{"role": "user", "content": f"Extract customer profile:\\n\\n{raw_text}"}]
    
    for attempt in range(MAX_RETRIES + 1):
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            tools=[extract_tool],
            tool_choice={"type": "tool", "name": "output_customer_profile"},  # FORCED!
            messages=messages
        )
        
        # Claude MUST call this tool (because we forced it)
        tool_block = next(b for b in response.content if b.type == "tool_use")
        
        # STEP 5: Validate with Pydantic
        try:
            profile = CustomerProfile(**tool_block.input)
            return profile  # ✅ Validated and typed!
        except ValidationError as e:
            if attempt < MAX_RETRIES:
                # Tell Claude what went wrong and retry
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": [{
                    "type": "tool_result",
                    "tool_use_id": tool_block.id,
                    "content": f"Validation failed: {e}. Please fix and try again.",
                    "is_error": True
                }]})
            else:
                raise RuntimeError(f"Extraction failed after {MAX_RETRIES} retries: {e}")</div>

<h3>Why Each Step Matters</h3>
<div class="code-block">Step 1 (Pydantic model): Defines the EXACT types and fields you need
Step 2 (JSON Schema):    Automatic conversion — no manual schema writing
Step 3 (Tool):           Wraps the schema as a tool Claude can "call"
Step 4 (Forced call):    Claude MUST produce data matching the schema
Step 5 (Validation):     Catches any remaining issues + enables retry</div>

<h3>The Retry Ceiling — Why It's Critical</h3>
<div class="warning-point">⚠️ <strong>ALWAYS set MAX_RETRIES (usually 1-2).</strong> Without it:
<br>• A genuinely unparseable document → infinite loop
<br>• Each retry = another API call = more money
<br>• 1 retry fixes most issues (typos, wrong types)
<br>• 2 retries is generous
<br>• 3+ is wasteful — if it fails twice, it's not going to work</div>

<h3>Confidence Routing</h3>
<p>Add a confidence field to route uncertain results to human review:</p>
<div class="code-block">class ProfileWithConfidence(CustomerProfile):
    confidence: float = Field(
        description="Your confidence in this extraction (0.0-1.0). "
        "Set below 0.7 if any field required guessing or is uncertain."
    )

THRESHOLD = 0.7

result = extract_profile(text)
if result.confidence < THRESHOLD:
    queue_for_human_review(result)  # Low confidence → human checks it
else:
    process_automatically(result)   # High confidence → auto-process</div>

<div class="key-point">💡 <strong>Confidence isn't calibrated</strong> (the model's 0.8 might be your 0.6), but it's still useful as a ROUTING signal. You're not trusting the exact number — you're using it to separate "confident extractions" from "uncertain ones" that need human review.</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> This pattern (Pydantic + forced tool_choice + validation + retry ceiling) is THE answer whenever the exam asks about structured output. It appears in multiple domains. Know it cold. The exam will also ask about the retry ceiling — "what happens without it?" → infinite loops.</div>
`
        },
        {
          title: "4.4 — Context Engineering: What Goes In Matters",
          type: "lesson",
          content: `
<h2>🧠 Position, Structure, and Pruning</h2>
<p>What you put IN the context window, and WHERE you put it, directly affects output quality. This is context engineering.</p>

<h3>The Attention Pattern</h3>
<div class="code-block">Context window attention distribution:

[SYSTEM PROMPT]        ████████████ (VERY HIGH attention)
[First few messages]   ████████     (High attention)
[Middle of long conv]  ████         (WEAKEST — "lost in the middle")
[Recent messages]      ████████████ (VERY HIGH attention — recency)

Takeaway: Put critical info at TOP (system prompt) or keep it RECENT.
          Don't bury important instructions in the middle of long prompts.</div>

<h3>Case-Facts Pinning</h3>
<p>For agent conversations, pin unchanging facts at the top:</p>
<div class="code-block">system = """You are a support agent.

## CASE FACTS (do not modify or forget)
- Customer: Alice Johnson (CUST-12345)
- Plan: Enterprise ($499/mo)  
- Issue: Billing discrepancy on INV-2024-891
- Account status: Active since 2023-01-15
- Escalation: billing-team@acme.com

## Rules
1. Always reference the customer by name
2. Always reference the specific invoice number
3. Refunds over $200 require manager approval
..."""</div>

<div class="key-point">💡 <strong>Why pin at the top?</strong> System prompt gets consistently high attention regardless of conversation length. Case facts won't get "lost in the middle" even after 30 turns of conversation.</div>

<h3>Tool Output Pruning</h3>
<p>Tools often return way more data than needed:</p>
<div class="code-block">// Tool returns 8KB of customer data
raw_result = {
    "id": "CUST-12345",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "plan": "enterprise",
    "created": "2023-01-15",
    "billing_history": [...500 entries...],
    "preferences": {...50 fields...},
    "internal_notes": [...100 notes...],
    "analytics": {...2000 data points...}
}

// But you only needed 3 fields!
// ❌ BAD: Append all 8KB to context (wastes tokens, dilutes attention)
// ✅ GOOD: Prune to what's actually needed

pruned_result = {
    "name": raw_result["name"],
    "plan": raw_result["plan"],
    "email": raw_result["email"]
}
// 95% smaller. All relevant info preserved. Context stays clean.</div>

<h3>Conversation Summarization</h3>
<div class="code-block">// Long conversation with resolved sub-issues:
// BEFORE (wastes context on resolved stuff):
messages = [
    "I was charged twice for March",        // 
    "Let me look into that...",              //  These 6 messages
    "I see the double charge...",            //  are about a RESOLVED
    "Processing refund REF-123...",          //  issue. Why keep them
    "Refund processed! Anything else?",      //  in full detail?
    "Thanks! Also my API key isn't working"  // ← THIS is the active issue
]

// AFTER (summarized resolved, full detail on active):
messages = [
    "[RESOLVED] Double March charge — refund REF-123 processed.",
    "Also my API key isn't working"  // Active issue in full
]
// Saves ~80% of tokens on resolved turns</div>

<h3>System Prompt Caching</h3>
<div class="code-block">// Cache large, unchanging system prompts:
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    system=[{
        "type": "text",
        "text": "... 2KB of policy rules and case facts ...",
        "cache_control": {"type": "ephemeral"}  // Cache this!
    }],
    messages=messages
)
// First call: cache_creation_input_tokens > 0 (wrote to cache)
// Second call: cache_read_input_tokens > 0 (reading — 90% cheaper!)</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "Agent quality degrades over long conversations." The answer hierarchy:
<br>1. Prune verbose tool outputs (keep only used fields)
<br>2. Summarize resolved turns (one-liner summaries)
<br>3. Context compaction as last resort (full summary of everything)
<br>Never "just increase max_tokens" — that treats the symptom, not the cause.</div>
`
        },
        {
          title: "Chapter 4 Exam — Prompts & Structured Output",
          type: "quiz",
          questions: [
            {
              q: "Claude keeps converting European dates (28/02/2024) to US format despite instructions. Best fix?",
              options: ["Repeat the instruction in bold", "Set temperature to 0", "Add few-shot examples showing correct date preservation", "Use a regex post-processor"],
              correct: 2,
              explanation: "Few-shot examples lock corner-case behavior that prose can't reach. One example showing '28/02/2024' preserved as-is will fix what repeated instructions couldn't."
            },
            {
              q: "What's the production pattern for guaranteed JSON output from Claude?",
              options: ["'Return JSON' in the system prompt", "Pydantic schema → tool definition → forced tool_choice → validation → retry with ceiling", "Set response_format: json", "Parse text output with regex"],
              correct: 1,
              explanation: "The canonical pattern: define schema (Pydantic), wrap as tool, force with tool_choice, validate, retry on failure (with max_retries ceiling). This gives deterministic structured output."
            },
            {
              q: "An extraction pipeline has max_retries = 0 (no retries). A minor type mismatch causes failure. What should change?",
              options: ["Set max_retries to 1 or 2 — one retry usually fixes minor schema issues", "Remove validation entirely", "Switch models", "Make all fields optional"],
              correct: 0,
              explanation: "One retry usually fixes minor issues (wrong type, missing field the model can infer from context). Zero retries means any fixable error becomes a hard failure. Two retries is generous; more is wasteful."
            },
            {
              q: "Where in the context does the model attend MOST weakly?",
              options: ["System prompt", "First user message", "Middle of long conversations", "Most recent messages"],
              correct: 2,
              explanation: "'Lost in the middle' effect: attention is strongest at beginning (system prompt) and end (recent messages), weakest in the middle of long sequences. Pin critical info at top or keep it recent."
            },
            {
              q: "A tool returns 12KB of customer data. You only need name, email, status. What should you do?",
              options: ["Append the full 12KB", "Strip to only the 3 needed fields before appending to messages", "Summarize in natural language", "Store externally and pass a reference ID"],
              correct: 1,
              explanation: "Prune tool outputs to only consumed fields. 12KB of unused data wastes tokens, bloats context, dilutes attention, and increases cost — all with zero benefit."
            },
            {
              q: "The model's confidence field returns 0.85. Can you trust this is perfectly calibrated?",
              options: ["Yes — Claude is well-calibrated", "No — but it's still useful as a routing signal to separate auto-process from human-review", "Only if temperature is 0", "Only after fine-tuning"],
              correct: 1,
              explanation: "Model-reported confidence isn't calibrated (their 0.8 might be your 0.6). But it's useful for ROUTING: high confidence → auto-process, low confidence → human review. Adjust the threshold empirically."
            },
            {
              q: "Your system prompt has 10 rules. The most critical rule is #7 (buried in the middle). How to improve?",
              options: ["Add 'IMPORTANT:' prefix to rule 7", "Move the most critical rule to position 1 (beginning gets strongest attention)", "Repeat it at the end too", "Make it bold"],
              correct: 1,
              explanation: "Attention is strongest at the beginning. Your most critical rules should be first. The 'lost in the middle' effect means buried rules get weaker attention, especially in long prompts."
            },
            {
              q: "How many few-shot examples are typically needed to lock formatting behavior?",
              options: ["10+ for reliability", "2-3 is usually sufficient", "Just 1", "Depends entirely on the model size"],
              correct: 1,
              explanation: "2-3 examples typically pin format/style. More for complex extraction. Diminishing returns after ~8. Start with 2, add more only if the specific edge case still fails."
            }
          ]
        }
      ]
    },
    // ============================================================
    // CHAPTER 5: Context Management & Reliability (15%)
    // ============================================================
    {
      id: 5,
      title: "Context Management & Reliability",
      weight: "15%",
      icon: "🛡️",
      description: "Escalation patterns, error propagation, provenance, graceful degradation, and production monitoring.",
      sections: [
        {
          title: "5.1 — Escalation: When to Hand Off to Humans",
          type: "lesson",
          content: `
<h2>🚨 The Four Valid Escalation Triggers</h2>
<p>One of the most heavily tested topics. The exam LOVES asking "should the agent escalate here?" Know these four triggers cold.</p>

<h3>ONLY Escalate For These Four Reasons</h3>
<div class="code-block">1. POLICY — Action exceeds agent's authority
   Examples: Refund > $500, account closure, legal request, 
   contract modification, anything requiring human sign-off

2. COMPLEXITY — Problem is beyond agent's capability  
   Examples: Multi-system failure, needs access agent doesn't have,
   requires domain expertise the agent lacks, cross-department issue

3. RISK — Security, compliance, or safety concern
   Examples: Potential data breach, regulatory issue, fraud detection,
   unauthorized access attempt, liability situation

4. EXPLICIT REQUEST — Customer directly asks for a human
   Examples: "I want to talk to a manager", "Get me a human",
   "Transfer me to someone real", "I want to speak to a person"</div>

<h3>The Critical Rule About Explicit Requests</h3>
<div class="warning-point">⚠️ <strong>When a customer says "I want a human" — ESCALATE IMMEDIATELY.</strong>
<br><br>
❌ "Let me try one more thing first..." — NO
<br>❌ "Can you tell me more about your issue?" — NO  
<br>❌ "I think I can still help you with that" — NO
<br>❌ "Are you sure? I'm able to resolve most issues" — NO
<br><br>
✅ "I'll connect you with a team member right away. Let me pass along a summary so they can help quickly." — YES
<br><br>
The customer told you what they want. <strong>Honor it.</strong> Every second you delay after they've asked is making them angrier.</div>

<h3>NEVER Escalate For This Reason</h3>
<div class="code-block">SENTIMENT (frustration, anger, rudeness) ≠ ESCALATION TRIGGER

"I'm so frustrated with this!" → Continue helping. Don't escalate.
"This is ridiculous!"          → Continue helping. Don't escalate.
"Your service is terrible!"    → Continue helping. Don't escalate.
"I've been waiting forever!"   → Continue helping. Don't escalate.

WHY? Because frustrated customers with solvable problems should be SOLVED,
not dumped on the human queue. Escalating on sentiment:
- Clogs the human queue with solvable issues
- Doesn't actually fix the customer's problem
- The human agent still needs to solve the same problem!

The EXCEPTION: "I'm frustrated AND I want to talk to a human"
→ This IS an explicit request. Escalate.</div>

<h3>The Structured Escalation Handoff</h3>
<p>When you DO escalate, pass a structured summary — NOT the raw transcript:</p>
<div class="code-block">{
    "escalation_summary": {
        "customer": {
            "name": "Alice Johnson",
            "id": "CUST-12345",
            "plan": "Enterprise",
            "tenure": "18 months"
        },
        "issue": {
            "summary": "Billing discrepancy: charged $234.50 but contract says $199/mo",
            "invoice": "INV-2024-891",
            "impact": "Customer overcharged $35.50 for 3 months ($106.50 total)"
        },
        "attempted_resolution": [
            "Verified charge exists in billing system",
            "Confirmed invoice differs from contract rate",
            "Agent cannot override contract pricing (requires billing manager)"
        ],
        "blocked_by": "Pricing adjustment requires billing manager authority",
        "recommended_action": "Review contract vs actual charges, issue credit for overpayment",
        "priority": "medium",
        "trigger": "policy"
    }
}</div>

<div class="key-point">💡 <strong>A good escalation summary is a BRIEFING:</strong>
<br>• WHO — Customer identity and context
<br>• WHAT — Specific issue with details
<br>• TRIED — What the agent already attempted
<br>• BLOCKED — Why the agent can't resolve it
<br>• RECOMMENDED — What the human should do
<br><br>
The human agent should be able to pick up WITHOUT re-asking the customer anything.</div>

<div class="exam-tip">🎓 <strong>Exam Pattern:</strong> Every exam includes 1-2 escalation questions. They'll describe a frustrated customer and ask "should the agent escalate?" 
<br>• Customer is frustrated + issue is solvable → NO (frustration ≠ escalation)
<br>• Customer says "get me a human" → YES (explicit request)
<br>• Amount exceeds policy → YES (policy trigger)
<br>• Agent can't access needed system → YES (complexity trigger)</div>
`
        },
        {
          title: "5.2 — Error Propagation & Graceful Degradation",
          type: "lesson",
          content: `
<h2>⚡ When Things Break — And They Will</h2>
<p>Production agents fail. APIs timeout. Databases go down. Models get overloaded. The question isn't IF but HOW your agent recovers.</p>

<h3>Error Response Strategy by Category</h3>
<div class="code-block">TRANSIENT errors (timeout, rate limit, temporary outage):
  → Retry with exponential backoff
  → Max 3 retries (1s, 2s, 4s delays)
  → If still failing: degrade gracefully or queue for later

PERMANENT errors (not found, invalid input, deleted resource):
  → Do NOT retry (wastes money, same result every time)
  → Inform user clearly what happened
  → Offer alternatives if possible

POLICY errors (over limit, unauthorized, blocked by rules):
  → Do NOT retry or try to work around it
  → Explain the constraint to the user
  → Offer escalation path if appropriate

MODEL errors (refusal, overload, context too long):
  → Refusal: Don't retry same request. Rephrase or handle gracefully.
  → Overload: Retry with backoff, or fall back to smaller model.
  → Context too long: Compact/summarize and retry.</div>

<h3>Multi-Agent Error Handling</h3>
<div class="code-block">def coordinator_with_resilience(user_request):
    # Subagent A: Research
    try:
        research = run_subagent("research", task_a)
    except TransientError:
        # Retry once for transient failures
        try:
            research = run_subagent("research", task_a)
        except Exception:
            # Graceful degradation: proceed without research
            research = None
            
    except PermanentError as e:
        # Can't get research — inform coordinator
        research = f"[Research unavailable: {e.message}]"
    
    # Subagent B: Analysis (might depend on research)
    try:
        if research:
            analysis = run_subagent("analysis", f"Analyze: {research}")
        else:
            analysis = run_subagent("analysis", f"Analyze directly: {user_request}")
    except Exception:
        analysis = "[Analysis unavailable]"
    
    # Coordinator synthesizes whatever we have
    # Key: Don't crash entirely because one piece failed
    return synthesize(user_request, research, analysis)</div>

<div class="key-point">💡 <strong>Graceful Degradation Principle:</strong> One failed component shouldn't crash the entire system.
<br>• Research fails? → Proceed with direct analysis.
<br>• Analysis fails? → Return raw research results.
<br>• Both fail? → Tell the user what happened and offer alternatives.
<br>• NEVER return a raw exception to the user.</div>

<h3>The Production Fallback Chain</h3>
<div class="code-block">def handle_request(request):
    # Level 1: Full capability
    try:
        return full_agent(request, model="claude-sonnet-4-20250514")
    except ModelOverloaded:
        pass
    
    # Level 2: Reduced capability (cheaper model)
    try:
        return simple_agent(request, model="claude-haiku-4-5-20251016")
    except ModelOverloaded:
        pass
    
    # Level 3: Cached/template response
    cached = get_cached_response(request.category)
    if cached:
        return cached
    
    # Level 4: Queue for human
    return queue_for_human(request, reason="all models unavailable")</div>

<h3>Provenance — Tracking Where Information Came From</h3>
<div class="code-block">// WITHOUT provenance (dangerous):
"Your account balance is $1,234.56"
// Where did this number come from? Real data? Hallucination? Old cache?

// WITH provenance (trustworthy):
{
    "claim": "Your account balance is $1,234.56",
    "source": {
        "tool": "check_balance",
        "tool_call_id": "call_abc123",
        "timestamp": "2024-03-15T10:30:00Z",
        "raw_value": 123456
    }
}
// Now we can verify: this came from a real tool call at a specific time</div>

<p>In multi-agent systems, provenance flows structurally:</p>
<div class="code-block">// Research agent returns:
{
    "findings": [
        {"claim": "Product X launched in 2023", "source": "company blog", "url": "..."},
        {"claim": "Revenue grew 40%", "source": "Q3 earnings report", "url": "..."}
    ]
}

// Synthesis agent PRESERVES these source attributions in final output
// Never strips provenance — it's how humans verify the agent's claims</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "The synthesis has no source attributions" → Require subagents to return claim-source mappings, coordinator preserves them through synthesis. Provenance is STRUCTURAL (built into the data format), not a prompt instruction ("please cite sources").</div>
`
        },
        {
          title: "5.3 — Production Monitoring & Observability",
          type: "lesson",
          content: `
<h2>📊 What to Monitor in Production Agents</h2>
<p>You can't fix what you can't see. Production agents need observability at the loop level.</p>

<h3>The Three Critical Streams</h3>
<div class="code-block">Stream 1: stop_reason distribution
  → Are we seeing unexpected stop_reasons?
  → Spike in "max_tokens"? → Responses being truncated
  → Spike in "refusal"? → Something triggering safety filters
  → Track: stop_reason per request, over time

Stream 2: Tool call patterns  
  → Which tools are called most?
  → Which tools fail most? (and with what error categories?)
  → Are tools being called in unexpected combinations?
  → Track: tool_name, success/failure, latency, error_category

Stream 3: Hook decisions
  → How often are hooks blocking calls?
  → Are hooks themselves failing? (CRITICAL — hook failures = policy gaps)
  → Track: hook_name, allowed/blocked, any hook errors</div>

<h3>Key Metrics Dashboard</h3>
<div class="code-block">// Essential metrics for any production agent:

1. Request success rate (% ending in end_turn vs errors)
2. Average iterations per request (how many loop cycles?)
3. Tool error rate by category (transient vs permanent vs policy)
4. Hook block rate (how often is policy being enforced?)
5. Token usage per request (cost tracking)
6. Latency percentiles (p50, p95, p99)
7. Escalation rate (what % goes to humans?)
8. Cache hit rate (are we saving money?)</div>

<h3>Alerting Rules</h3>
<div class="code-block">CRITICAL alerts (page someone):
  • Hook error rate > 0 (policy enforcement might be broken)
  • Tool permanent error rate spike (dependency down?)
  • Stop_reason "refusal" spike (safety filter triggering)
  • Iteration count > MAX_ITERATIONS (infinite loop detected)

WARNING alerts (investigate soon):
  • Cache miss rate increasing (something invalidating cache?)
  • Average token usage trending up (context bloat?)
  • Escalation rate spike (agent failing more often?)
  • Latency p95 > threshold (slowdown detected)</div>

<h3>Structured Logging Pattern</h3>
<div class="code-block">import structlog

logger = structlog.get_logger()

def run_agent_with_logging(request):
    logger.info("agent.start", request_id=req_id, customer=customer_id)
    
    for iteration in range(MAX_ITERATIONS):
        response = client.messages.create(...)
        
        logger.info("agent.iteration",
            iteration=iteration,
            stop_reason=response.stop_reason,
            tokens_used=response.usage.output_tokens
        )
        
        if response.stop_reason == "tool_use":
            for tool_call in get_tool_calls(response):
                hook_result = run_hooks(tool_call)
                logger.info("agent.hook",
                    tool=tool_call.name,
                    allowed=hook_result.allowed
                )
                
                if hook_result.allowed:
                    result = execute_tool(tool_call)
                    logger.info("agent.tool_result",
                        tool=tool_call.name,
                        success=not result.get("isError"),
                        error_category=result.get("errorCategory")
                    )
    
    logger.info("agent.complete", 
        request_id=req_id, 
        total_iterations=iteration,
        outcome="success" or "escalated" or "error"
    )</div>

<div class="exam-tip">🎓 <strong>Exam Tip:</strong> "How do you monitor a production agent?" → Log the three streams: stop_reason, tool calls, hook decisions. Build a dashboard. The exam wants SPECIFIC observability at the loop level, not generic "add logging."</div>
`
        },
        {
          title: "Chapter 5 Exam — Context & Reliability",
          type: "quiz",
          questions: [
            {
              q: "A customer says 'I'm really frustrated with this service!' Should the agent escalate?",
              options: ["Yes — frustrated customers need human attention", "No — frustration alone is not an escalation trigger. Continue resolving the issue.", "Yes — to protect the company's reputation", "Ask the customer if they want escalation"],
              correct: 1,
              explanation: "Sentiment (frustration, anger) is NOT an escalation trigger. Valid triggers: policy breach, complexity beyond capability, security risk, or explicit 'I want a human' request. Frustrated customers with solvable issues should be solved."
            },
            {
              q: "A customer says 'Get me a manager RIGHT NOW.' The issue is simple and almost resolved. What should the agent do?",
              options: ["Finish resolving since it's almost done", "Explain that the issue is simple", "Escalate immediately with a structured summary", "Ask one clarifying question first"],
              correct: 2,
              explanation: "Explicit request for human = IMMEDIATE escalation. Doesn't matter if the issue is simple or nearly resolved. The customer said what they want. Honor it. Pass a structured summary."
            },
            {
              q: "A subagent fails with a timeout (transient error). What should the coordinator do?",
              options: ["Escalate to human immediately", "Retry once, then degrade gracefully if retry also fails", "Skip that subagent entirely", "Return the raw error to the user"],
              correct: 1,
              explanation: "Transient errors should be retried. If retry fails, degrade gracefully (proceed without that component, return partial results, or use cached data). Don't crash entirely for one flaky component."
            },
            {
              q: "The synthesis output has no source attributions. What's the architectural fix?",
              options: ["Add 'cite sources' to the synthesis prompt", "Require subagents to return claim-source mappings; coordinator preserves them through synthesis", "Add a fact-checking agent", "Log all API calls"],
              correct: 1,
              explanation: "Provenance must be STRUCTURAL — built into the data format. Subagents return {claim, source} pairs. Coordinator preserves these through synthesis. You can't reliably add citations after the fact."
            },
            {
              q: "An escalation passes only 'Customer needs help with billing.' to the human agent. What's wrong?",
              options: ["Nothing — keep it brief", "Missing structured context: who, what specifically, what was tried, what's blocked, recommended action", "Should include the full transcript instead", "Needs more urgency"],
              correct: 1,
              explanation: "A good escalation = structured briefing. WHO (customer ID, plan), WHAT (specific issue), TRIED (what agent attempted), BLOCKED (why agent can't resolve), RECOMMENDED (what human should do). Human shouldn't re-ask anything."
            },
            {
              q: "Agent quality degrades after 20+ turns. What's the FIRST thing to try?",
              options: ["Increase max_tokens", "Switch to a larger model", "Prune verbose tool outputs and summarize resolved turns", "Restart the conversation"],
              correct: 2,
              explanation: "Context bloat is the likely cause. First fix: prune tool outputs to only used fields. Second: summarize resolved turns into one-liners. These are proactive fixes. Compaction (full summary) is the last resort."
            },
            {
              q: "Production monitoring for a Claude agent should track (at minimum):",
              options: ["Total cost only", "stop_reason distribution, tool call patterns, and hook decisions", "Response length", "User satisfaction scores"],
              correct: 1,
              explanation: "Three critical streams: stop_reason (loop behavior), tool calls (what actions, what errors), hook decisions (what was blocked). Build a dashboard on these before shipping."
            },
            {
              q: "An API call fails with a 'not found' error (permanent). Should the agent retry?",
              options: ["Yes — retry 3 times with backoff", "No — permanent errors won't be fixed by retrying. Inform the user and offer alternatives.", "Yes — but with a longer delay", "Only if the user asks"],
              correct: 1,
              explanation: "Permanent errors (not found, invalid input) produce the same result every time. Retrying wastes money. Inform the user clearly what happened and offer alternative paths."
            }
          ]
        }
      ]
    }
  ],
  mockTests: [
    {
      id: "mock1",
      title: "Mock Test 1: Full Exam Simulation",
      description: "20 questions across all domains, exam-weighted",
      timeLimit: 40,
      passingScore: 720,
      questions: [
        {q:"An agent checks 'if response.text.endswith(\".\")' to detect completion. What's wrong?",options:["Missing null check","Should branch on stop_reason, never parse text for control flow","Should check for '!' too","Needs try/catch"],correct:1,explanation:"Always branch on stop_reason. Never parse text for control flow. A period can appear anywhere in normal text."},
        {q:"The forced tool call pattern uses tool_choice: {type: 'tool', name: '...'}. What does this guarantee?",options:["Faster responses","Claude MUST produce data matching that tool's input_schema","Lower cost","Better accuracy"],correct:1,explanation:"Forcing a specific tool means Claude must call it with inputs matching the schema. This is the structured output guarantee."},
        {q:"A PreToolUse hook crashes with an unhandled exception. Correct behavior?",options:["Skip hook, proceed with tool call","Block the tool call and log the error (fail closed)","Retry hook 3 times","Return generic success"],correct:1,explanation:"Hooks must fail CLOSED. If you can't verify the policy (hook crashed), block the action. Silent failures = policy evaporating."},
        {q:"MCP server configured as stdio: {command:'npx', args:[...]}. What transport is this?",options:["HTTP","SSE","stdio — local process via stdin/stdout","WebSocket"],correct:2,explanation:"command + args = stdio transport. Local subprocess communicating via standard input/output."},
        {q:"Your .mcp.json has a literal API key instead of ${ENV_VAR}. What's the security risk?",options:["Performance degradation","The key gets committed to git/source control","The key expires faster","No risk"],correct:1,explanation:".mcp.json is committed to source control. Literal secrets in it end up in git history forever. Always use ${ENV_VAR} expansion."},
        {q:"A customer says 'This is so annoying! Can you just fix my order?' Should the agent escalate?",options:["Yes — customer is annoyed","No — this is frustration + a solvable request. Fix the order.","Yes — to prevent bad reviews","Ask if they want a human"],correct:1,explanation:"Frustration + actionable request = continue helping. The customer wants their order fixed, not a human. Sentiment alone ≠ escalation."},
        {q:"Context isolation in multi-agent systems means:",options:["Encrypting messages between agents","Each subagent has its own message array; only final outputs are shared","Using separate API keys","Running on different servers"],correct:1,explanation:"Context isolation = separate message arrays per subagent. Internal tool calls and reasoning stay private. Only final structured output flows to the coordinator."},
        {q:"cache_control: {type:'ephemeral'} on the last tool definition does what?",options:["Makes the tool temporary","Caches all tool definitions for ~5 min, making repeat calls ~90% cheaper","Deletes the tool after use","Marks it as optional"],correct:1,explanation:"Cache marker on the last tool caches everything up to and including it. Subsequent calls read from cache (~90% cheaper) for ~5 min TTL."},
        {q:"A tool returns {isError:true, errorCategory:'transient', isRetryable:true}. What should Claude do?",options:["Give up immediately","Retry the tool call after a brief wait","Escalate to human","Ignore the error"],correct:1,explanation:"transient + isRetryable = temporary failure that may succeed on retry. Claude should wait briefly and try again. This is the structured error pattern."},
        {q:"CLAUDE.md at project root vs ~/.claude/CLAUDE.md — which overrides which?",options:["User always overrides project","Project overrides user (for that project)","They never conflict","Depends on file size"],correct:1,explanation:"Project-level overrides user-level within that project. User-level provides global defaults; project-level provides team conventions that win locally."},
        {q:"An agent with 20 tools keeps calling the wrong one. Best fix?",options:["Increase temperature","Add a triage/classification step, then provide only relevant tools (3-5)","Reorder the tools array","Add 'pick carefully' to prompt"],correct:1,explanation:"Two-stage: classify intent first, then provide only relevant tools. Reduces confusion from too many similar options."},
        {q:"disable_parallel_tool_use: true is needed when:",options:["You have too many tools","Tool B depends on Tool A's output (ordering matters)","You want faster responses","Tools are expensive"],correct:1,explanation:"When tools have dependencies (B needs A's result), disable parallel to ensure sequential execution. Claude can only request one tool per response."},
        {q:"claude -p is used for:",options:["Plan mode","Non-interactive/headless mode for CI/CD and scripts","Password authentication","Parallel execution"],correct:1,explanation:"claude -p = headless mode. Runs Claude Code non-interactively, outputting results. Perfect for CI/CD pipelines, automated reviews, scripting."},
        {q:"A synthesis agent produces claims without source attributions. The fix is:",options:["'Cite sources' in the prompt","Structural: subagents return claim-source mappings, coordinator preserves them","Post-processing","A separate citation agent"],correct:1,explanation:"Provenance is structural, not prompt-based. Build source tracking into the data format at the subagent level, preserve through synthesis."},
        {q:"The exam has 60 questions in 120 minutes. Passing score is:",options:["700/1000","720/1000","750/1000","800/1000"],correct:1,explanation:"CCA-F: 60 MCQs, 120 min, passing 720/1000. No penalty for guessing — always answer every question."},
        {q:"Which domain has the highest exam weight?",options:["Tool Design (18%)","Claude Code (20%)","Agentic Architecture (27%)","Prompt Engineering (20%)"],correct:2,explanation:"Domain 1 (Agentic Architecture & Orchestration) is 27% — the single biggest lever on the exam."},
        {q:"Agent quality degrades after long conversations. Priority fix order?",options:["Switch model → increase tokens → restart","Prune tool outputs → summarize resolved turns → compact as last resort","Compact immediately → restart → increase tokens","Increase max_tokens → add more context → retry"],correct:1,explanation:"Fix context bloat: 1) Prune verbose tool outputs, 2) Summarize resolved turns, 3) Full compaction only as last resort. Don't treat symptoms (increase tokens)."},
        {q:"tool_choice: {type:'none'} does what?",options:["Removes all tools permanently","Disables tools for THIS turn only (tools stay defined for future turns)","Makes tools optional","Disables the model"],correct:1,explanation:"type: 'none' = no tools this turn. Claude must respond with text only. Tools remain available for subsequent turns. Use for summaries or confirmations."},
        {q:"The escalation handoff should include:",options:["The full 40-turn transcript","A structured summary: who, what, tried, blocked, recommended action","Just the customer name","The error logs"],correct:1,explanation:"Structured briefing: customer ID + specific issue + what was tried + what's blocked + recommended action. Human shouldn't need to re-ask anything."},
        {q:"Defense in depth: system prompt says 'max $500'. Tool description says 'max $500'. Hook checks amount > $500. The hook is the only GUARANTEE because:",options:["It runs first","It's deterministic code that cannot be overridden by prompts or adversarial inputs","It's more expensive","It has access to the database"],correct:1,explanation:"Prompts and descriptions are suggestions the model usually follows. Hooks are code — deterministic, can't be overridden by clever prompts. They're the guarantee layer."}
      ]
    },
    {
      id: "final",
      title: "🏆 FINAL Assessment — Am I Ready?",
      description: "20 hard scenario questions. Pass 720+ and you're ready to book the real exam.",
      timeLimit: 40,
      passingScore: 720,
      questions: [
        {q:"SCENARIO: Bank loan agent processes a $15,000 approval despite the $10,000 limit in its system prompt. Root cause?",options:["Model bug","System prompt is guidance, not enforcement. The $10K limit must be in a PreToolUse hook.","Temperature too high","Training data issue"],correct:1,explanation:"Hard financial limits MUST be in code (hooks). System prompts are suggestions. An adversarial or complex input can cause the model to exceed prompt-stated limits."},
        {q:"SCENARIO: Research agent's internal tool calls appear in the synthesis agent's context. Impact?",options:["Better synthesis","Context contamination — synthesis agent is confused by irrelevant internal details, quality drops","No impact","Faster processing"],correct:1,explanation:"Context isolation violation. Synthesis only needs final research output. Internal tool calls add noise, bloat context, and confuse the synthesis agent's reasoning."},
        {q:"SCENARIO: Invoice extractor works on US invoices ($ 1,234.56) but fails on German ones (1.234,56€). System prompt says 'handle all formats'. Fix?",options:["More detail in system prompt","Add 2-3 few-shot examples showing German format extraction","Switch to a European model","Post-process with regex"],correct:1,explanation:"Regional format behavior is a corner case that prose can't pin reliably. Few-shot examples showing correct European decimal comma handling will lock the behavior."},
        {q:"SCENARIO: Agent exceeds 30 iterations without completing. No errors, just keeps calling tools. What's likely wrong?",options:["Model is slow","Agent doesn't have a MAX_ITERATIONS ceiling, or stop condition is broken","Tools are too complex","Network latency"],correct:1,explanation:"Infinite tool-calling loop: either no iteration limit, or the stop condition (checking for end_turn) is implemented incorrectly. Always have MAX_ITERATIONS as a safety ceiling."},
        {q:"SCENARIO: Customer says 'I want a refund for all 6 months, TRANSFER ME NOW.' Agent processes the refund request first. What's wrong?",options:["Should process refund — customer asked for it","Should escalate IMMEDIATELY on 'transfer me now' — explicit request for human, don't process anything else","Should ask for clarification","Should deny the refund"],correct:1,explanation:"'Transfer me NOW' = explicit escalation request. Honor it immediately. Don't process the refund first — the customer wants a human. Pass a summary and hand off."},
        {q:"SCENARIO: MCP server works locally but returns 'Bearer undefined' in staging. .mcp.json uses ${API_TOKEN}. Cause?",options:["Token expired","API_TOKEN env var isn't set in the staging environment","Wrong URL","Server crashed"],correct:1,explanation:"${ENV_VAR} expansion requires the variable to actually exist in the runtime environment. Works locally (where you set it), fails in staging (where it's missing). Set the env var in staging."},
        {q:"SCENARIO: You need guaranteed JSON output. You ask Claude 'return JSON please.' Sometimes it works, sometimes you get text + JSON mixed. Production fix?",options:["More emphatic prompt","Forced tool call pattern: define tool with schema + tool_choice: {type:'tool',name:'...'} + Pydantic validation + retry ceiling","Set temperature to 0","Use stop_sequences"],correct:1,explanation:"The canonical pattern. Prompt-only approaches are unreliable. Forced tool call guarantees schema-conforming output with validation as backup."},
        {q:"SCENARIO: Agent monitors hook throws an exception. The system proceeds to execute the tool anyway. Assessment?",options:["Fine — hooks are optional","CRITICAL FAILURE — hooks should fail closed (block on error), not fail open","Normal behavior","Expected — hooks are best-effort"],correct:1,explanation:"Hooks failing open = policy enforcement gap. Must fail CLOSED: if the hook can't verify the policy, block the action. This is a production security vulnerability."},
        {q:"SCENARIO: Coordinator agent uses claude-sonnet-4 for everything including triage of 10,000 daily requests. 80% are simple FAQs. Cost optimization?",options:["Batch requests","Use Haiku for triage + simple FAQs, only escalate complex ones to Sonnet","Reduce max_tokens","Cache everything"],correct:1,explanation:"Two-tier model selection: cheap model (Haiku) handles 80% simple cases. Only complex cases (20%) go to Sonnet. Dramatically reduces cost while maintaining quality where it matters."},
        {q:"SCENARIO: Agent's tool has description 'Updates customer data'. It's being called for reads, writes, and deletes. Fix?",options:["Rename it","Split into specific tools (read_customer, update_customer, delete_customer) with precise descriptions","Add 'use carefully' to description","Restrict with tool_choice"],correct:1,explanation:"One vague tool doing everything is an anti-pattern. Split into specific tools with clear boundaries. Each tool does ONE thing with a precise when-to-use description."},
        {q:"SCENARIO: Subtree CLAUDE.md in frontend/ says 'use Tailwind'. Developer works on backend file. Does this rule apply?",options:["Yes — all CLAUDE.md files always load","No — subtree files only load when Claude reads files in THAT directory","Depends on model","Only in Plan mode"],correct:1,explanation:"Subtree CLAUDE.md only loads on-demand when files in that subdirectory are accessed. Backend work never triggers frontend/CLAUDE.md. Rules stay scoped."},
        {q:"SCENARIO: An agent retries a 'customer not found' error 5 times. Each retry returns the same error. Problem?",options:["Need more retries","Should NOT retry permanent errors. 'Not found' won't change by retrying. Inform user.","Network issue","Wrong endpoint"],correct:1,explanation:"Permanent errors produce the same result every time. Retrying wastes API calls and money. Return structured error with isRetryable: false so Claude knows to inform the user, not retry."},
        {q:"SCENARIO: cache_creation_input_tokens shows 3000 on call 1. cache_read_input_tokens shows 0 on call 2 (30 seconds later). Debug?",options:["Cache is working fine","Cached content changed between calls (invalidating cache), or cache_control is on wrong block","Wait longer","Wrong model"],correct:1,explanation:"Cache miss within TTL means: content changed (any modification invalidates), or the cache_control marker wasn't placed correctly. Verify exact same content between calls."},
        {q:"SCENARIO: Agent needs to: verify identity → check eligibility → process application (strict order). Architecture?",options:["Single agent, trust model to order correctly","disable_parallel_tool_use: true + dependency descriptions in tools + PreToolUse hook validating preconditions","Three sequential agents","Manual orchestration without AI"],correct:1,explanation:"Triple-layer ordering: disable_parallel prevents simultaneous calls, descriptions state dependencies, hooks validate preconditions (e.g., can't process without identity verified)."},
        {q:"SCENARIO: The exam presents a question where all 4 options seem plausible. Strategy?",options:["Pick the longest answer","Eliminate 'prompt-only' options for hard guarantees, then pick the most architecturally sound remaining option","Always pick C","Skip it"],correct:1,explanation:"Elimination strategy: for hard guarantees, cross out prompt-only answers. For architecture, cross out 'single agent for everything' and 'no coordinator'. Pick the option showing proper layer enforcement."},
        {q:"SCENARIO: Production agent sends responses containing internal terms like 'tool_use_id: call_abc123'. Fix?",options:["Ignore — users won't notice","Add a Stop hook that validates final output and strips internal system details","Add to system prompt: 'don't show IDs'","Lower verbosity"],correct:1,explanation:"A Stop hook (fires before response reaches user) can validate and sanitize final output. Catches internal details that leaked through the model's response. Defense in depth."},
        {q:"SCENARIO: Team argues about putting a $500 refund limit in CLAUDE.md vs a hook. Which is correct?",options:["CLAUDE.md is fine — it's the team convention file","Hook — financial limits must be in code because prompts can be overridden","Either works equally well","Neither — put in tool description only"],correct:1,explanation:"Financial limits = hard guarantee = code (hook). CLAUDE.md is guidance that CAN be overridden. A hook is deterministic. Put the limit in CLAUDE.md as guidance AND in a hook as enforcement (defense in depth)."},
        {q:"SCENARIO: You need to classify incoming requests into 4 categories reliably. Best pattern?",options:["Keywords matching","Define a classify tool with enum of 4 categories + force it with tool_choice: {type:'tool',name:'classify'}","Ask Claude to pick a category in text","Train a separate classifier"],correct:1,explanation:"Forced tool call with enum constraint: define a tool whose input has an enum field listing valid categories. Force with tool_choice. Claude MUST select from the valid options — deterministic routing."},
        {q:"What percentage of the exam is covered by Domains 1+3+4 combined?",options:["50%","60%","67% (27% + 20% + 20%)","75%"],correct:2,explanation:"D1 (27%) + D3 (20%) + D4 (20%) = 67% of the exam. These three domains are the biggest levers. Weight your study time accordingly."},
        {q:"SCENARIO: An agent's overall architecture works but costs 3x the budget. The main cost is sending 10 tool definitions (5000 tokens) on every call. Fix?",options:["Remove tools","Add cache_control: {type:'ephemeral'} on the last tool — caches all definitions for ~90% savings on repeat calls","Use shorter descriptions","Switch to Haiku"],correct:1,explanation:"Tool caching: mark the last tool with cache_control. All definitions get cached. Repeat calls read from cache at ~90% less cost. The definitions don't change between calls — perfect caching candidate."}
      ]
    }
  ],
  enrollmentGuide: {
    title: "How to Register for the CCA-F Exam",
    steps: [
      {step:1,title:"Create Anthropic Partner Academy Account",detail:"Go to anthropic-partners.skilljar.com. You need partner org affiliation. Check with your manager or visit claude.com/partners."},
      {step:2,title:"Complete Free Prep Courses",detail:"Take the 4 free courses on anthropic.skilljar.com: Claude 101, Building with the API, Intro to MCP, Claude Code in Action."},
      {step:3,title:"Take Anthropic Practice Exam",detail:"Available through Partner Academy. Target 900+/1000 before booking real exam. Best readiness indicator."},
      {step:4,title:"Register & Pay ($125)",detail:"From certification page, click Register. Pay $125. Pearson VUE emails scheduling instructions."},
      {step:5,title:"Schedule via Pearson VUE",detail:"Log in to pearsonvue.com/anthropic. Choose online (OnVUE) or test center. No deadline."},
      {step:6,title:"Exam Day",detail:"120 min, 60 MCQs, closed-book, proctored. Results in 2 business days. Pass: 720/1000. No penalty for guessing!"}
    ],
    links: [
      {url:"https://anthropic-partners.skilljar.com/page/partner-certifications",label:"Anthropic Partner Academy"},
      {url:"https://www.pearsonvue.com/us/en/anthropic.html",label:"Pearson VUE - Anthropic"},
      {url:"https://anthropic.skilljar.com",label:"Free Anthropic Academy Courses"}
    ]
  }
};
