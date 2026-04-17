"""Entry point: python run_mcp_server.py"""
import asyncio
from notebook_lm_mcp.server import main

if __name__ == "__main__":
    asyncio.run(main())
