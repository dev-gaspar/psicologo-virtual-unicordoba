FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install specific requirement for llama-cpp-python as requested
RUN pip install llama-cpp-python==0.2.76 --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu --prefer-binary

COPY . .

CMD ["python", "start_server.py"]
