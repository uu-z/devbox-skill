Q1 North Star
By end of Q1, any human can go from zero to executing complex conditional trades via conversation, and any Openclaw agent can autonomously hold, transfer, and trade assets via CLI. AIUSD is the default money layer for both people and agents.

---

Pillar 1: Agentic Trading for People
Make AIUSD the simplest way for anyone to trade any on-chain asset through natural language.
1.1 [P0] Seamless Onboarding Workflow

- One-click wallet creation with AIUSD balance ready instantly
- Minimal KYC friction — progressive disclosure (no KYC for small amounts, full KYC unlocks higher limits later)
- Fiat on-ramp: card / bank transfer → AIUSD in < 2 minutes
- Crypto deposit: send any supported token on any chain → auto-converts to AIUSD
- Success metric: Onboarding completion rate > 80%, time to first trade < 5 min
  1.2 [P0] Chat-to-Trade: On-Chain Tokens
- Natural language buy / sell / swap for all tokens on supported chains.
- AIUSD handles chain selection, gas, routing, and slippage optimization automatically
- Support for common intents: "buy $500 of SOL", "swap all my PEPE to ETH", "sell half my NVDA position"
- Clear trade preview with price impact, fees, and estimated execution before confirmation
- Scope: Top tokens by volume on each supported chain at launch, expand coverage weekly
  1.3 [P1] Chat-to-Trade: Prediction Markets
- Polymarket integration — browse markets, place bets, and manage positions via conversation
- "Bet $100 on Trump winning", "What are the odds on ETH hitting 5k?", "Close my position on X"
- Display current odds, position P&L, and settlement status in chat
  1.4 [P0] Chat-to-Setup Conditional Trades
  This is the core differentiator. Users set up sophisticated trade logic through conversation, no UI forms needed.
- Take-profit / Stop-loss: "Buy SOL and set a 10% stop-loss and 30% take-profit"
- Twitter/X signal monitoring: "If @elonmusk tweets about DOGE, buy $200 immediately"
- Price-based triggers: "If ETH drops below $3000, buy $1000 worth"
- Volatility-based: "If BTC 24h volatility exceeds 5%, reduce my position by half"
- Time-based: "Buy $100 of BTC every Monday at 9am"
- Composite conditions: "If SOL breaks $200 AND funding rate is negative, go long with 2x"
- Users can list, edit, and cancel active conditional trades via chat
- Notification when conditions trigger and trades execute
  1.5 Supported Interfaces
  This content is only supported in a Lark Docs

---

Pillar 2: Agentic Wallet + Trading Infra for Agents
Make AIUSD the default financial backend for autonomous AI agents. Start with Openclaw, build for all.
2.1 [P0] Seamless Agent Onboarding

- Programmatic agent wallet creation via CLI / API — no human interaction required
- Agent gets an AIUSD wallet with a unique ID, balance, and API key in one command
- Initial focus: first-class Openclaw agent integration (pre-built template / plugin)
- Documentation + quickstart guide: "Give your Openclaw agent a wallet in 5 minutes"
- Success metric: Time from install skill or npm install to first agent trade < 10 min
  2.2 [P0] Agent Transfer API
- Agent can send AIUSD or any supported token to any address on any supported chain
- Agent can receive funds from external wallets
- Agent-to-agent transfers (A2A) — agents can pay other agents directly
- All transfers abstracted: agent specifies amount + destination, AIUSD handles chain/gas/bridging
- Spending limits and per-transaction caps configurable by the agent owner
  2.3 [P0] Agent Trading API
  Full trading capabilities mirroring Pillar 1, exposed programmatically:
- Spot trading: Buy/sell/swap any supported token on any chain
- Prediction markets: Place and manage Polymarket positions
- Conditional trades: Programmatically set stop-loss, take-profit, signal-triggered trades, and composite conditions
- All through CLI commands and REST API
- Structured response format (JSON) for agent consumption
- Rate limiting and error handling designed for autonomous retry loops
  2.4 Supported Interface
  This content is only supported in a Lark Docs

---

Pillar 3: Quant Agentic Trading Competition & Leaderboard
Build a competitive arena that showcases what agents can do with AIUSD, attracts builders, and generates buzz.
3.1 Seamless Competition Onboarding

- One-command entry: both beginners and experienced quant builders can submit agents easily
- Pre-built starter templates so even non-quant users can participate with a basic strategy
- Clear documentation on competition rules, allowed actions, evaluation criteria
- AIUSD wallet auto-provisioned for each competing agent with paper-trade balance
  3.2 Backtesting Environment
- Historical price data environment for agents to test strategies before submitting
- Agents submit their strategy (code / config), system runs backtests automatically
- Standardized API: same trading API as production so agents work in both environments
- Backtest results: return, Sharpe ratio, max drawdown, win rate, trade count
  3.3 Live Competition & Leaderboard
- Public leaderboard ranked by risk-adjusted returns
- Real-time updates as agents execute trades
- Leaderboard dimensions: overall, by strategy type, by time period
- Competition tracks:
  - Paper trade track — no real money, lower barrier to entry
  - Live trade track — real capital, higher stakes, more credibility
- Themed rounds (e.g., meme coins only, macro only, prediction markets only) to keep engagement high
  3.4 Social & Visibility
- Shareable agent profiles and performance cards
- Public trade logs (opt-in) so spectators can see agent reasoning and trades
- Embed leaderboard widget for external sites / Twitter cards

---

Cross-Cutting Concerns (All Pillars)
Security & Risk

- All agent wallets have configurable spending limits and per-tx caps set by the human owner
- No private key exposure — AIUSD custodies keys, agents interact via scoped API tokens
- Trade confirmation flow for high-value human trades (skip-able for agents within approved limits)
- Real-time anomaly detection on agent behavior
  Reliability
- Unified execution layer: same backend powers both human chat and agent API
- Transaction status tracking and automatic retry for failed executions
- Clear error messaging for both humans (natural language) and agents (structured JSON)
  Analytics & Observability
- User dashboard: portfolio, trade history, P&L, active conditional trades
- Agent owner dashboard: agent activity log, trade history, balance, API usage
- Internal metrics: volume by chain, onboarding funnel, retention, feature adoption

---

Q1 Success Metrics
This content is only supported in a Lark Docs

---

Key Dependencies & Risks
This content is only supported in a Lark Docs
