#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time : 2024/10/21 23:03
# @Author : GUOYU

from fastapi import APIRouter
import requests
import json

chat_router = APIRouter()

import logging
from fastapi.responses import StreamingResponse

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import HTTPException, status
from fastapi.requests import Request
import logging

logger = logging.getLogger(__name__)


@chat_router.post("/chat")
async def chat(request: Request):
    try:
        # 解析请求体
        data = await request.json()
        user_input = data.get("message")
        url = 'http://localhost:11434/api/chat'

        # 要发送的数据
        data = {
            "model": "qwen2.5:0.5b",  # 指定模型名称
            "messages": [
                {"role": "system", "content": "你是一个助手"},
                {"role": "user", "content": str(user_input)}
            ],
            "stream": True
        }
        return StreamingResponse(fetch_streaming_response(url, data), media_type="text/plain")

    except HTTPException as http_exc:
        # 处理HTTP异常
        logger.error(f"HTTP error occurred: {http_exc.detail}")
        raise http_exc

    except Exception as exc:
        # 处理其他异常
        logger.error(f"An unexpected error occurred: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


# def get_chat_response(message):
#     import ollama
#
#     # 对 message 进行验证和清理
#     if not isinstance(message, str):
#         raise ValueError("Message must be a string")
#     message = message.strip()  # 去除首尾空白字符
#
#     stream1 = ollama.chat(
#         model='qwen2.5:0.5b',
#         messages=[{'role': 'user', 'content': message}],
#         stream=True,
#     )
#     for chunk in stream1:
#         yield chunk['message']['content']

# # 调用 get_chat_response 并处理流式返回的数据
# for response_chunk in get_chat_response("给我写个冒泡"):
#     print(response_chunk, end='', flush=True)


def fetch_streaming_response(url, data):
    json_data = json.dumps(data)
    response = requests.post(url, data=json_data, headers={'Content-Type': 'application/json'}, stream=True)

    # 检查请求是否成功
    if response.status_code == 200:
        output = ''
        # 逐个读取响应内容
        for chunk in response.iter_lines(decode_unicode=True):
            if chunk:  # 确保 chunk 不是空字符串
                try:
                    # 解析 JSON 数据
                    chunk_data = json.loads(chunk)
                    content = chunk_data.get('message', {}).get('content', '')
                    done = chunk_data.get('done', False)

                    # 将内容添加到输出字符串
                    output += content

                    # 打印内容
                    print(content, end='')
                    yield content
                    # 如果完成，退出循环
                    if done:
                        break
                except json.JSONDecodeError as e:
                    print(f"解析错误: {e}")
        return output
    else:
        print(f"请求失败，状态码：{response.status_code}")
        return None
