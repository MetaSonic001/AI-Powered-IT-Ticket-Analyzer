"""
Data Service - Dataset Management, Analytics, and Data Processing
Handles Kaggle datasets, web scraping, data preprocessing, and analytics
"""

import asyncio
import aiohttp
import pandas as pd
import numpy as np
from pathlib import Path
import json
import csv
from typing import Dict, List, Any, Optional, Union
import logging
from datetime import datetime, timedelta
import re
import uuid
from urllib.parse import urlparse
from datetime import datetime, timezone

# Data processing libraries
try:
    import kaggle
    KAGGLE_AVAILABLE = True
except ImportError:
    KAGGLE_AVAILABLE = False

try:
    from crawl4ai import WebCrawler
    CRAWL4AI_AVAILABLE = True
except ImportError:
    CRAWL4AI_AVAILABLE = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import KMeans
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


import os

print("KAGGLE_USERNAME:", os.getenv("KAGGLE_USERNAME"))
print("KAGGLE_KEY:", os.getenv("KAGGLE_KEY"))

from core.config import Settings
from core.models import DatasetInfo, ProcessingStats
from services.knowledge_service import KnowledgeService
from services.model_service import ModelService
from utils.logger import setup_logger

logger = setup_logger(__name__)

class DataService:
    """Data service for managing datasets and analytics"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.datasets_cache = {}
        self.analytics_cache = {}
        self.processing_stats = {}
        self.initialized = False
        
    async def initialize(self):
        """Initialize data service"""
        try:
            logger.info("📊 Initializing Data Service...")
            
            # Ensure data directories exist
            Path(self.settings.data_dir).mkdir(parents=True, exist_ok=True)
            Path(f"{self.settings.data_dir}/kaggle").mkdir(parents=True, exist_ok=True)
            Path(f"{self.settings.data_dir}/scraped").mkdir(parents=True, exist_ok=True)
            Path(f"{self.settings.data_dir}/processed").mkdir(parents=True, exist_ok=True)
            
            # Setup Kaggle if available
            await self._setup_kaggle()
            
            # Setup web crawler
            await self._setup_crawler()
            
            self.initialized = True
            logger.info("✅ Data Service initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Data Service initialization failed: {str(e)}")
            raise
    
    async def _setup_kaggle(self):
        """Setup Kaggle API client"""
        if not KAGGLE_AVAILABLE:
            logger.warning("Kaggle API not available")
            return
        
        if not (self.settings.kaggle_username and self.settings.kaggle_key):
            logger.warning("Kaggle credentials not provided")
            return
        
        try:
            # Configure Kaggle API
            kaggle.api.authenticate()
            logger.info("✅ Kaggle API configured successfully")
            
        except Exception as e:
            logger.warning(f"Kaggle setup failed: {str(e)}")
    
    async def _setup_crawler(self):
        """Setup web crawler"""
        if not CRAWL4AI_AVAILABLE:
            logger.warning("Crawl4AI not available, using basic web scraping")
            return
        
        try:
            # Initialize crawler
            self.crawler = WebCrawler(verbose=False)
            await self.crawler.astart()
            logger.info("✅ Web crawler initialized")
            
        except Exception as e:
            logger.warning(f"Web crawler setup failed: {str(e)}")
    
    async def load_initial_datasets(self):
        """Load initial datasets from various sources"""
        
        logger.info("🔄 Loading initial datasets...")
        
        try:
            # Load IT helpdesk datasets
            await self._load_it_helpdesk_datasets()
            
            # Load sample tickets for testing
            await self._load_sample_tickets()
            
            # Load documentation datasets
            await self._load_documentation_datasets()
            
            logger.info("✅ Initial datasets loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load initial datasets: {str(e)}")
    
    async def _load_it_helpdesk_datasets(self):
        """Load IT helpdesk datasets from Kaggle"""
        
        if not KAGGLE_AVAILABLE:
            logger.info("Loading synthetic IT helpdesk data...")
            await self._create_synthetic_it_data()
            return
        
        try:
            # List of IT-related datasets on Kaggle
            datasets = [
                "suraj520/customer-support-ticket-dataset",
                "adisongoh/it-service-ticket-classification-dataset",
            ]
            
            for dataset_id in datasets:
                try:
                    await self._download_kaggle_dataset(dataset_id)
                except Exception as e:
                    logger.warning(f"Failed to download {dataset_id}: {str(e)}")
                    continue
                    
        except Exception as e:
            logger.error(f"Kaggle dataset loading failed: {str(e)}")
            await self._create_synthetic_it_data()
    
    async def _download_kaggle_dataset(self, dataset_id: str):
        """Download a specific Kaggle dataset"""
        
        try:
            dataset_dir = Path(f"{self.settings.data_dir}/kaggle/{dataset_id.replace('/', '_')}")
            dataset_dir.mkdir(parents=True, exist_ok=True)
            
            # Download dataset
            kaggle.api.dataset_download_files(
                dataset_id,
                path=str(dataset_dir),
                unzip=True
            )
            
            # Process the downloaded files
            await self._process_kaggle_dataset(dataset_dir, dataset_id)
            
            logger.info(f"✅ Downloaded and processed: {dataset_id}")
            
        except Exception as e:
            logger.error(f"Failed to download {dataset_id}: {str(e)}")
            raise
    
    async def _process_kaggle_dataset(self, dataset_dir: Path, dataset_id: str):
        """Process a downloaded Kaggle dataset"""
        
        try:
            # Find CSV files in the dataset
            csv_files = list(dataset_dir.glob("*.csv"))
            
            for csv_file in csv_files:
                logger.info(f"Processing CSV file: {csv_file.name}")
                
                # Read CSV
                df = pd.read_csv(csv_file)
                
                # Identify ticket-like data
                ticket_columns = self._identify_ticket_columns(df)
                
                if ticket_columns:
                    await self._process_ticket_data(df, ticket_columns, dataset_id, csv_file.name)
                else:
                    logger.warning(f"No ticket-like columns found in {csv_file.name}")
                    
        except Exception as e:
            logger.error(f"Failed to process dataset {dataset_id}: {str(e)}")
    
    def _identify_ticket_columns(self, df: pd.DataFrame) -> Dict[str, Optional[str]]:
        """Identify columns that contain ticket information"""
        
        columns = df.columns.str.lower().tolist()
        
        # Common column mappings
        mappings = {
            'title': None,
            'description': None,
            'category': None,
            'priority': None,
            'status': None,
            'resolution': None
        }
        
        # Title columns
        title_candidates = ['title', 'subject', 'summary', 'issue', 'ticket_title', 'problem']
        for candidate in title_candidates:
            matching_cols = [col for col in columns if candidate in col]
            if matching_cols:
                mappings['title'] = df.columns[columns.index(matching_cols[0])]
                break
        
        # Description columns
        desc_candidates = ['description', 'details', 'issue_description', 'problem_description', 'content']
        for candidate in desc_candidates:
            matching_cols = [col for col in columns if candidate in col]
            if matching_cols:
                mappings['description'] = df.columns[columns.index(matching_cols[0])]
                break
        
        # Category columns
        cat_candidates = ['category', 'type', 'classification', 'issue_type']
        for candidate in cat_candidates:
            matching_cols = [col for col in columns if candidate in col]
            if matching_cols:
                mappings['category'] = df.columns[columns.index(matching_cols[0])]
                break
        
        # Priority columns
        priority_candidates = ['priority', 'urgency', 'severity']
        for candidate in priority_candidates:
            matching_cols = [col for col in columns if candidate in col]
            if matching_cols:
                mappings['priority'] = df.columns[columns.index(matching_cols[0])]
                break
        
        # Resolution columns
        resolution_candidates = ['resolution', 'solution', 'fix', 'answer', 'resolved']
        for candidate in resolution_candidates:
            matching_cols = [col for col in columns if candidate in col]
            if matching_cols:
                mappings['resolution'] = df.columns[columns.index(matching_cols[0])]
                break
        
        # Check if we have at least title and description
        if mappings['title'] and mappings['description']:
            return mappings
        
        return {}
    
    async def _process_ticket_data(
        self, 
        df: pd.DataFrame, 
        column_mappings: Dict[str, Optional[str]], 
        dataset_id: str,
        filename: str
    ):
        """Process ticket data and add to knowledge base"""
        
        processed_count = 0
        failed_count = 0
        
        for index, row in df.iterrows():
            try:
                # Extract ticket information
                title = str(row[column_mappings['title']]) if column_mappings['title'] else f"Ticket {index}"
                description = str(row[column_mappings['description']]) if column_mappings['description'] else ""
                category = str(row[column_mappings['category']]) if column_mappings['category'] else "General Support"
                priority = str(row[column_mappings['priority']]) if column_mappings['priority'] else "Medium"
                resolution = str(row[column_mappings['resolution']]) if column_mappings['resolution'] else ""
                
                # Skip if essential data is missing
                if not title or len(description) < 10:
                    failed_count += 1
                    continue
                
                # Prepare metadata
                metadata = {
                    "type": "ticket",
                    "dataset_id": dataset_id,
                    "filename": filename,
                    "index": index,
                    "priority": priority,
                    "has_resolution": bool(resolution and resolution.strip() and resolution.lower() != 'nan'),
                    "original_data": row.to_dict()
                }
                
                # If we have a resolution, add it as a solution document
                if resolution and resolution.strip() and resolution.lower() != 'nan':
                    solution_title = f"Solution: {title}"
                    solution_content = f"Problem: {description}\n\nSolution: {resolution}"
                    
                    # Add solution to knowledge base (this would need the knowledge service)
                    # For now, we'll store it in our cache
                    self._cache_knowledge_item({
                        "title": solution_title,
                        "content": solution_content,
                        "category": category,
                        "type": "solution",
                        "source": dataset_id,
                        "metadata": metadata
                    })
                
                # Also cache the ticket itself
                self._cache_knowledge_item({
                    "title": title,
                    "content": description,
                    "category": category,
                    "type": "ticket",
                    "source": dataset_id,
                    "metadata": metadata
                })
                
                processed_count += 1
                
                # Log progress every 100 items
                if processed_count % 100 == 0:
                    logger.info(f"Processed {processed_count} tickets from {filename}")
                
            except Exception as e:
                logger.error(f"Failed to process row {index}: {str(e)}")
                failed_count += 1
                continue
        
        logger.info(f"✅ Processed {processed_count} tickets, {failed_count} failed from {filename}")
        
        # Update processing stats
        self.processing_stats[f"{dataset_id}_{filename}"] = {
            "processed": processed_count,
            "failed": failed_count,
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        }
    
    def _cache_knowledge_item(self, item: Dict[str, Any]):
        """Cache knowledge item for later ingestion"""
        
        if "knowledge_cache" not in self.datasets_cache:
            self.datasets_cache["knowledge_cache"] = []
        
        self.datasets_cache["knowledge_cache"].append(item)
    
    async def _create_synthetic_it_data(self):
        """Create synthetic IT support data for testing"""
        
        logger.info("Creating synthetic IT support data...")
        
        synthetic_tickets = [
            {
                "title": "Cannot connect to WiFi network",
                "description": "User reports being unable to connect to the corporate WiFi network. Getting 'incorrect password' error even with correct credentials.",
                "category": "Network Issues",
                "priority": "High",
                "resolution": "Reset network adapter settings and updated WiFi drivers. Issue resolved."
            },
            {
                "title": "Outlook keeps crashing when opening emails",
                "description": "Microsoft Outlook application crashes every time user tries to open emails with attachments. No error message displayed.",
                "category": "Email Issues", 
                "priority": "Medium",
                "resolution": "Repaired Office installation through Control Panel. Outlook now working normally."
            },
            {
                "title": "Printer not responding to print jobs",
                "description": "Office printer shows as online in system but doesn't print any documents sent to it. Print queue shows jobs as pending.",
                "category": "Printer Problems",
                "priority": "Medium", 
                "resolution": "Cleared print queue and restarted print spooler service. Printer now functioning correctly."
            },
            {
                "title": "Computer extremely slow startup and performance",
                "description": "Laptop takes over 10 minutes to boot up and applications run very slowly. Hard drive usage constantly at 100%.",
                "category": "System Performance",
                "priority": "High",
                "resolution": "Replaced failing hard drive with SSD and increased RAM. System performance restored to normal."
            },
            {
                "title": "Unable to access shared network drive",
                "description": "User cannot access the shared company network drive that contains project files. Getting 'access denied' error.",
                "category": "Network Issues",
                "priority": "High", 
                "resolution": "Updated user permissions on network drive and mapped drive using correct domain credentials."
            },
            {
                "title": "Software license activation failing",
                "description": "New software installation cannot activate license key. Error message indicates license server connection timeout.",
                "category": "Software Problems",
                "priority": "Medium",
                "resolution": "Configured firewall to allow license server communication. License activated successfully."
            },
            {
                "title": "Monitor display flickering and distorted",
                "description": "External monitor connected to laptop shows flickering screen and distorted colors. Issue persists with different cables.",
                "category": "Hardware Failures", 
                "priority": "Medium",
                "resolution": "Updated graphics drivers and adjusted display settings. Monitor now displaying correctly."
            },
            {
                "title": "Security warning about suspicious email attachments",
                "description": "User received email with suspicious attachment and clicked it before realizing potential threat. Concerned about malware infection.",
                "category": "Security Incidents",
                "priority": "Critical",
                "resolution": "Ran full antivirus scan and malware removal tools. No threats detected. User educated on email security best practices."
            },
            {
                "title": "Cannot log into company system after password change",
                "description": "After mandatory password change, user unable to log into company systems. Password appears correct but login fails.",
                "category": "Account Access",
                "priority": "High",
                "resolution": "Reset password through Active Directory and synced across all systems. User can now log in successfully."
            },
            {
                "title": "Mobile device not syncing with company email",
                "description": "Employee's smartphone stopped syncing with company Exchange server. Email not updating on mobile device.",
                "category": "Mobile Device Support",
                "priority": "Medium",
                "resolution": "Reconfigured Exchange settings on mobile device and updated security certificates. Email sync restored."
            }
        ]
        
        # Add synthetic tickets to cache
        for i, ticket in enumerate(synthetic_tickets):
            # Add as solution
            self._cache_knowledge_item({
                "title": f"Solution: {ticket['title']}",
                "content": f"Problem: {ticket['description']}\n\nSolution: {ticket['resolution']}",
                "category": ticket['category'],
                "type": "solution",
                "source": "synthetic",
                "metadata": {
                    "type": "solution",
                    "priority": ticket['priority'],
                    "synthetic": True,
                    "index": i
                }
            })
            
            # Add as ticket
            self._cache_knowledge_item({
                "title": ticket['title'],
                "content": ticket['description'],
                "category": ticket['category'],
                "type": "ticket",
                "source": "synthetic",
                "metadata": {
                    "type": "ticket",
                    "priority": ticket['priority'],
                    "synthetic": True,
                    "index": i
                }
            })
        
        logger.info(f"✅ Created {len(synthetic_tickets)} synthetic IT support tickets")
    
    async def _load_sample_tickets(self):
        """Load additional sample tickets for variety"""
        
        # Add more diverse ticket examples
        sample_categories = {
            "Database Issues": [
                {
                    "title": "Database connection timeout errors",
                    "description": "Application users reporting frequent database connection timeout errors during peak hours.",
                    "resolution": "Optimized database queries and increased connection pool size. Timeouts resolved."
                },
                {
                    "title": "Backup job failing nightly",
                    "description": "Automated database backup job has been failing every night for the past week with insufficient space error.",
                    "resolution": "Cleaned up old backup files and allocated additional storage space. Backups now completing successfully."
                }
            ],
            "Application Errors": [
                {
                    "title": "CRM application freezing during data entry", 
                    "description": "Customer service team reports CRM application freezes when entering large amounts of customer data.",
                    "resolution": "Applied latest CRM patches and optimized data entry forms. Application stability improved."
                },
                {
                    "title": "Accounting software calculation errors",
                    "description": "Finance team discovered calculation discrepancies in monthly reports generated by accounting software.",
                    "resolution": "Updated accounting software to latest version which fixed calculation engine bugs."
                }
            ]
        }
        
        for category, tickets in sample_categories.items():
            for i, ticket in enumerate(tickets):
                self._cache_knowledge_item({
                    "title": f"Solution: {ticket['title']}",
                    "content": f"Problem: {ticket['description']}\n\nSolution: {ticket['resolution']}",
                    "category": category,
                    "type": "solution",
                    "source": "samples",
                    "metadata": {
                        "type": "solution",
                        "priority": "Medium",
                        "sample": True,
                        "category_index": i
                    }
                })
        
        logger.info("✅ Loaded additional sample tickets")
    
    async def _load_documentation_datasets(self):
        """Load IT documentation and knowledge articles"""
        
        # Common IT troubleshooting documentation
        documentation = [
            {
                "title": "Network Troubleshooting Guide",
                "content": """
                Step-by-step network troubleshooting process:
                1. Check physical connections (cables, power)
                2. Verify IP configuration (ipconfig /all)
                3. Test connectivity (ping gateway, DNS)
                4. Check network adapter status
                5. Restart network services if needed
                6. Contact network administrator for advanced issues
                
                Common solutions:
                - Reset network adapter: Device Manager > Network Adapters > Right-click > Disable/Enable
                - Flush DNS: cmd > ipconfig /flushdns
                - Reset TCP/IP stack: netsh winsock reset
                """,
                "category": "Network Issues",
                "tags": ["troubleshooting", "network", "connectivity"]
            },
            {
                "title": "Email Configuration Best Practices",
                "content": """
                Proper email client configuration steps:
                
                Outlook Configuration:
                1. File > Add Account > Manual setup
                2. Server settings: IMAP/POP3 or Exchange
                3. Configure incoming/outgoing server settings
                4. Test account settings before finishing
                
                Common Email Issues:
                - Authentication failures: Check username/password
                - Connection timeouts: Verify server settings and firewall
                - Sync issues: Check account settings and folder permissions
                
                Security considerations:
                - Always use encrypted connections (SSL/TLS)
                - Enable two-factor authentication
                - Regular password updates
                """,
                "category": "Email Issues", 
                "tags": ["email", "outlook", "configuration", "security"]
            },
            {
                "title": "Hardware Diagnostic Procedures",
                "content": """
                System hardware diagnostic checklist:
                
                Memory Issues:
                1. Run Windows Memory Diagnostic
                2. Check for loose RAM modules
                3. Test with minimal RAM configuration
                
                Hard Drive Problems:
                1. Check disk health with chkdsk
                2. Run manufacturer diagnostic tools
                3. Monitor S.M.A.R.T. status
                4. Check disk space usage
                
                Overheating Issues:
                1. Clean dust from fans and heat sinks
                2. Check CPU/GPU temperatures
                3. Verify fan operation
                4. Consider thermal paste replacement
                """,
                "category": "Hardware Failures",
                "tags": ["hardware", "diagnostics", "memory", "storage", "cooling"]
            }
        ]
        
        for doc in documentation:
            self._cache_knowledge_item({
                "title": doc['title'],
                "content": doc['content'],
                "category": doc['category'],
                "type": "documentation",
                "source": "internal_docs",
                "metadata": {
                    "type": "documentation",
                    "tags": doc['tags'],
                    "authoritative": True
                }
            })
        
        logger.info("✅ Loaded IT documentation articles")
    
    async def scrape_web_content(self, urls: List[str], source_type: str = "documentation") -> List[Dict[str, Any]]:
        """Scrape content from web URLs"""
        
        if not urls:
            return []
        
        scraped_content = []
        
        for url in urls:
            try:
                if hasattr(self, 'crawler') and CRAWL4AI_AVAILABLE:
                    content = await self._scrape_with_crawl4ai(url)
                else:
                    content = await self._scrape_with_basic_http(url)
                
                if content:
                    scraped_content.append({
                        "url": url,
                        "title": content.get("title", "Web Content"),
                        "content": content.get("content", ""),
                        "source_type": source_type,
                        "scraped_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                    })
                    
            except Exception as e:
                logger.error(f"Failed to scrape {url}: {str(e)}")
                continue
        
        logger.info(f"✅ Scraped {len(scraped_content)} web pages")
        return scraped_content
    
    async def _scrape_with_crawl4ai(self, url: str) -> Optional[Dict[str, Any]]:
        """Scrape content using Crawl4AI"""
        
        try:
            result = await self.crawler.arun(url=url)
            
            if result.success:
                return {
                    "title": result.metadata.get("title", ""),
                    "content": result.markdown,
                    "metadata": result.metadata
                }
            else:
                logger.warning(f"Failed to crawl {url}: {result.error_message}")
                return None
                
        except Exception as e:
            logger.error(f"Crawl4AI error for {url}: {str(e)}")
            return None
    
    async def _scrape_with_basic_http(self, url: str) -> Optional[Dict[str, Any]]:
        """Basic HTTP scraping fallback"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=30) as response:
                    if response.status == 200:
                        html = await response.text()
                        
                        # Basic HTML parsing
                        import re
                        
                        # Extract title
                        title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
                        title = title_match.group(1).strip() if title_match else "Web Content"
                        
                        # Extract text content (very basic)
                        # Remove HTML tags
                        text_content = re.sub(r'<[^>]+>', ' ', html)
                        # Clean up whitespace
                        text_content = re.sub(r'\s+', ' ', text_content).strip()
                        
                        return {
                            "title": title,
                            "content": text_content[:5000],  # Limit content length
                            "metadata": {"url": url, "status": response.status}
                        }
                    else:
                        logger.warning(f"HTTP {response.status} for {url}")
                        return None
                        
        except Exception as e:
            logger.error(f"Basic HTTP scraping error for {url}: {str(e)}")
            return None
    
    async def get_dashboard_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Generate dashboard analytics data"""
        
        try:
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Get cached knowledge items for analysis
            knowledge_items = self.datasets_cache.get("knowledge_cache", [])
            
            # Basic metrics
            total_tickets = len([item for item in knowledge_items if item.get("type") == "ticket"])
            total_solutions = len([item for item in knowledge_items if item.get("type") == "solution"])
            total_docs = len([item for item in knowledge_items if item.get("type") == "documentation"])
            
            # Category analysis
            category_stats = {}
            for item in knowledge_items:
                category = item.get("category", "Unknown")
                if category not in category_stats:
                    category_stats[category] = {
                        "category": category,
                        "total_tickets": 0,
                        "avg_resolution_hours": 24.0,  # Default estimate
                        "priority_distribution": {"Critical": 0, "High": 0, "Medium": 0, "Low": 0},
                        "common_issues": []
                    }
                
                if item.get("type") == "ticket":
                    category_stats[category]["total_tickets"] += 1
                    
                    priority = item.get("metadata", {}).get("priority", "Medium")
                    if priority in category_stats[category]["priority_distribution"]:
                        category_stats[category]["priority_distribution"][priority] += 1
            
            # Priority analysis
            priority_stats = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
            for item in knowledge_items:
                priority = item.get("metadata", {}).get("priority", "Medium")
                if priority in priority_stats:
                    priority_stats[priority] += 1
            
            # Generate trend data (mock data for now)
            trends = []
            for i in range(days):
                date = start_date + timedelta(days=i)
                trends.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "ticket_count": max(1, int(np.random.poisson(5))),  # Random but realistic
                    "avg_resolution_hours": round(np.random.uniform(4, 48), 1),
                    "top_category": np.random.choice(list(category_stats.keys())) if category_stats else "General Support"
                })
            
            # Recent tickets (last 10)
            recent_tickets = knowledge_items[-10:] if knowledge_items else []
            
            return {
                "metrics": {
                    "total_tickets_analyzed": total_tickets,
                    "avg_processing_time_ms": 850.5,  # Mock value
                    "accuracy_rate": 0.92,
                    "knowledge_base_size": len(knowledge_items),
                    "active_solutions": total_solutions
                },
                "category_stats": list(category_stats.values()),
                "priority_stats": [
                    {
                        "priority": priority,
                        "total_tickets": count,
                        "avg_resolution_hours": 24.0 if priority == "Medium" else (4.0 if priority == "Critical" else 12.0),
                        "categories": {}
                    }
                    for priority, count in priority_stats.items()
                ],
                "trends": trends,
                "recent_tickets": [
                    {
                        "title": item.get("title", ""),
                        "category": item.get("category", ""),
                        "type": item.get("type", ""),
                        "source": item.get("source", "")
                    }
                    for item in recent_tickets
                ]
            }
            
        except Exception as e:
            logger.error(f"Dashboard analytics generation failed: {str(e)}")
            # Return basic empty structure
            return {
                "metrics": {
                    "total_tickets_analyzed": 0,
                    "avg_processing_time_ms": 0.0,
                    "accuracy_rate": 0.0,
                    "knowledge_base_size": 0,
                    "active_solutions": 0
                },
                "category_stats": [],
                "priority_stats": [],
                "trends": [],
                "recent_tickets": []
            }
    
    async def generate_report(
        self, 
        report_type: str = "summary",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate analytical reports"""
        
        try:
            knowledge_items = self.datasets_cache.get("knowledge_cache", [])
            
            if report_type == "summary":
                return await self._generate_summary_report(knowledge_items, start_date, end_date)
            elif report_type == "category_analysis":
                return await self._generate_category_report(knowledge_items)
            elif report_type == "trend_analysis":
                return await self._generate_trend_report(knowledge_items, start_date, end_date)
            else:
                return {"error": f"Unknown report type: {report_type}"}
                
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            return {"error": str(e)}
    
    async def _generate_summary_report(
        self, 
        knowledge_items: List[Dict], 
        start_date: Optional[str], 
        end_date: Optional[str]
    ) -> Dict[str, Any]:
        """Generate summary report"""
        
        total_items = len(knowledge_items)
        tickets = [item for item in knowledge_items if item.get("type") == "ticket"]
        solutions = [item for item in knowledge_items if item.get("type") == "solution"]
        docs = [item for item in knowledge_items if item.get("type") == "documentation"]
        
        # Category distribution
        categories = {}
        for item in knowledge_items:
            category = item.get("category", "Unknown")
            categories[category] = categories.get(category, 0) + 1
        
        # Priority distribution
        priorities = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        for item in knowledge_items:
            priority = item.get("metadata", {}).get("priority", "Medium")
            if priority in priorities:
                priorities[priority] += 1
        
        return {
            "report_type": "summary",
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "period": {"start": start_date, "end": end_date},
            "totals": {
                "total_items": total_items,
                "tickets": len(tickets),
                "solutions": len(solutions),
                "documentation": len(docs)
            },
            "category_distribution": categories,
            "priority_distribution": priorities,
            "top_categories": sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5],
            "data_sources": list(set(item.get("source", "unknown") for item in knowledge_items))
        }
    
    async def _generate_category_report(self, knowledge_items: List[Dict]) -> Dict[str, Any]:
        """Generate category analysis report"""
        
        category_analysis = {}
        
        for item in knowledge_items:
            category = item.get("category", "Unknown")
            if category not in category_analysis:
                category_analysis[category] = {
                    "category": category,
                    "total_items": 0,
                    "tickets": 0,
                    "solutions": 0,
                    "documentation": 0,
                    "priorities": {"Critical": 0, "High": 0, "Medium": 0, "Low": 0},
                    "common_keywords": [],
                    "sources": set()
                }
            
            analysis = category_analysis[category]
            analysis["total_items"] += 1
            
            item_type = item.get("type", "unknown")
            if item_type in ["ticket", "solution", "documentation"]:
                analysis[item_type] += 1
            
            priority = item.get("metadata", {}).get("priority", "Medium")
            if priority in analysis["priorities"]:
                analysis["priorities"][priority] += 1
            
            analysis["sources"].add(item.get("source", "unknown"))
        
        # Convert sets to lists for JSON serialization
        for category in category_analysis.values():
            category["sources"] = list(category["sources"])
        
        return {
            "report_type": "category_analysis",
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "categories": category_analysis,
            "summary": {
                "total_categories": len(category_analysis),
                "most_common_category": max(category_analysis.items(), key=lambda x: x[1]["total_items"])[0] if category_analysis else None
            }
        }
    
    async def _generate_trend_report(
        self, 
        knowledge_items: List[Dict],
        start_date: Optional[str],
        end_date: Optional[str]
    ) -> Dict[str, Any]:
        """Generate trend analysis report"""
        
        # For now, generate mock trend data since we don't have time-series data
        days = 30
        trends = []
        
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=days-i-1)
            trends.append({
                "date": date.strftime("%Y-%m-%d"),
                "total_tickets": max(1, int(np.random.poisson(8))),
                "resolved_tickets": max(1, int(np.random.poisson(6))),
                "avg_resolution_time": round(np.random.uniform(2, 48), 1),
                "top_category": np.random.choice(["Network Issues", "Software Problems", "Hardware Failures"])
            })
        
        return {
            "report_type": "trend_analysis",
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "period": {"start": start_date, "end": end_date},
            "trends": trends,
            "insights": {
                "avg_daily_tickets": round(np.mean([t["total_tickets"] for t in trends]), 1),
                "peak_day": max(trends, key=lambda x: x["total_tickets"])["date"],
                "avg_resolution_time": round(np.mean([t["avg_resolution_time"] for t in trends]), 1)
            }
        }
    
    async def get_cached_knowledge(self) -> List[Dict[str, Any]]:
        """Get all cached knowledge items"""
        return self.datasets_cache.get("knowledge_cache", [])
    
    async def clear_cache(self):
        """Clear all cached data"""
        self.datasets_cache.clear()
        self.analytics_cache.clear()
        self.processing_stats.clear()
        logger.info("✅ All caches cleared")
    
    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get data processing statistics"""
        return {
            "processing_stats": self.processing_stats,
            "cache_size": len(self.datasets_cache.get("knowledge_cache", [])),
            "initialized": self.initialized,
            "available_features": {
                "kaggle": KAGGLE_AVAILABLE,
                "crawl4ai": CRAWL4AI_AVAILABLE,
                "sklearn": SKLEARN_AVAILABLE
            }
        }
    
    async def export_knowledge_data(self, format: str = "json") -> str:
        """Export cached knowledge data"""
        
        knowledge_items = self.datasets_cache.get("knowledge_cache", [])
        
        if format.lower() == "json":
            export_path = Path(f"{self.settings.data_dir}/export_knowledge_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json")
            
            with open(export_path, 'w', encoding='utf-8') as f:
                json.dump(knowledge_items, f, indent=2, ensure_ascii=False)
                
        elif format.lower() == "csv":
            export_path = Path(f"{self.settings.data_dir}/export_knowledge_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv")
            
            # Flatten data for CSV
            flattened_data = []
            for item in knowledge_items:
                flat_item = {
                    "title": item.get("title", ""),
                    "content": item.get("content", "")[:1000],  # Truncate for CSV
                    "category": item.get("category", ""),
                    "type": item.get("type", ""),
                    "source": item.get("source", ""),
                    "metadata": json.dumps(item.get("metadata", {}))
                }
                flattened_data.append(flat_item)
            
            df = pd.DataFrame(flattened_data)
            df.to_csv(export_path, index=False)
        else:
            raise ValueError(f"Unsupported export format: {format}")
        
        logger.info(f"✅ Exported {len(knowledge_items)} items to {export_path}")
        return str(export_path)