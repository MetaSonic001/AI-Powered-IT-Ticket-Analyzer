"""
Logger utility for the IT Ticket Analyzer
"""

import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional
import json
from datetime import datetime, timezone


def setup_logger(
    name: str,
    level: str = "INFO",
    log_file: Optional[str] = None,
    format_string: Optional[str] = None
) -> logging.Logger:
    """Setup a logger with console and optional file output"""
    
    if format_string is None:
        format_string = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Create logger
    logger = logging.getLogger(name)
    
    # Don't add handlers if they already exist
    if logger.handlers:
        return logger
    
    logger.setLevel(getattr(logging, level.upper()))
    
    # Create formatter
    formatter = logging.Formatter(format_string)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper()))
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (if specified)
    if log_file:
        # Ensure log directory exists
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(getattr(logging, level.upper()))
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

class StructuredLogger:
    """Structured logging for better analytics and monitoring"""
    
    def __init__(self, name: str, log_file: Optional[str] = None):
        self.logger = setup_logger(name, log_file=log_file)
        self.context = {}
    
    def set_context(self, **kwargs):
        """Set persistent context for all log messages"""
        self.context.update(kwargs)
    
    def clear_context(self):
        """Clear all context"""
        self.context.clear()
    
    def _format_message(self, message: str, **kwargs):
        """Format message with context and additional data"""
        data = {
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "message": message,
            "context": self.context,
            **kwargs
        }
        return json.dumps(data, ensure_ascii=False)
    
    def info(self, message: str, **kwargs):
        """Log info message with structured data"""
        self.logger.info(self._format_message(message, level="INFO", **kwargs))
    
    def error(self, message: str, **kwargs):
        """Log error message with structured data"""
        self.logger.error(self._format_message(message, level="ERROR", **kwargs))
    
    def warning(self, message: str, **kwargs):
        """Log warning message with structured data"""
        self.logger.warning(self._format_message(message, level="WARNING", **kwargs))
    
    def debug(self, message: str, **kwargs):
        """Log debug message with structured data"""
        self.logger.debug(self._format_message(message, level="DEBUG", **kwargs))

# Performance logging decorator
def log_performance(logger: logging.Logger):
    """Decorator to log function performance"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            import time
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                execution_time = (time.time() - start_time) * 1000
                logger.info(f"{func.__name__} executed in {execution_time:.2f}ms")
                return result
            except Exception as e:
                execution_time = (time.time() - start_time) * 1000
                logger.error(f"{func.__name__} failed after {execution_time:.2f}ms: {str(e)}")
                raise
        return wrapper
    return decorator

# Async performance logging decorator
def log_async_performance(logger: logging.Logger):
    """Decorator to log async function performance"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            import time
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                execution_time = (time.time() - start_time) * 1000
                logger.info(f"{func.__name__} executed in {execution_time:.2f}ms")
                return result
            except Exception as e:
                execution_time = (time.time() - start_time) * 1000
                logger.error(f"{func.__name__} failed after {execution_time:.2f}ms: {str(e)}")
                raise
        return wrapper
    return decorator