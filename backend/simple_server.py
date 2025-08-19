from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
import uvicorn
import os
import json
import subprocess
from datetime import datetime, timedelta
import bcrypt
import logging
from pydantic import BaseModel

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("simple_server")

# Initialize FastAPI app
app = FastAPI(title="AI News Summarizer - Mock Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT configuration
SECRET_KEY = "mock_secret_key_for_development_only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Mock database
class MockDB:
    def __init__(self):
        self.users = self._create_test_users()
        self.summaries = self._load_mock_summaries()
    
    def _create_test_users(self):
        """Create a diverse set of realistic test users"""
        test_users = {}
        
        # Realistic user data
        user_data = [
            ("Emily Rodriguez", "emily.rodriguez@gmail.com"),
            ("Marcus Chen", "marcus.chen@outlook.com"),
            ("Sarah Johnson", "sarah.johnson@yahoo.com"),
            ("Alex Patel", "alex.patel@gmail.com"),
            ("Jordan Williams", "jordan.williams@protonmail.com"),
            ("Maya Singh", "maya.singh@icloud.com"),
            ("David Thompson", "david.thompson@gmail.com"),
            ("Zara Ahmed", "zara.ahmed@outlook.com"),
            ("Ryan O'Connor", "ryan.oconnor@gmail.com"),
            ("Priya Sharma", "priya.sharma@yahoo.com"),
            ("James Morrison", "james.morrison@gmail.com"),
            ("Isabella Garcia", "isabella.garcia@outlook.com"),
            ("Kai Nakamura", "kai.nakamura@gmail.com"),
            ("Sofia Petrov", "sofia.petrov@protonmail.com"),
            ("Logan Davis", "logan.davis@icloud.com"),
            ("Aisha Hassan", "aisha.hassan@gmail.com"),
            ("Tyler Anderson", "tyler.anderson@outlook.com"),
            ("Lucia Rossi", "lucia.rossi@yahoo.com"),
            ("Ethan Kim", "ethan.kim@gmail.com"),
            ("Nina Schmidt", "nina.schmidt@gmail.com"),
            ("Carlos Mendez", "carlos.mendez@outlook.com"),
            ("Ava Taylor", "ava.taylor@protonmail.com"),
            ("Samuel Lee", "samuel.lee@gmail.com"),
            ("Fatima Al-Rashid", "fatima.alrashid@icloud.com"),
            ("Noah Brown", "noah.brown@yahoo.com"),
            ("Chloe Martin", "chloe.martin@gmail.com"),
            ("Lucas Gonzalez", "lucas.gonzalez@outlook.com"),
            ("Aaliyah Washington", "aaliyah.washington@gmail.com"),
            ("Mason Wilson", "mason.wilson@protonmail.com"),
            ("Yuki Tanaka", "yuki.tanaka@gmail.com"),
            ("Oliver Clark", "oliver.clark@icloud.com"),
            ("Amara Okafor", "amara.okafor@yahoo.com"),
            ("Gabriel Silva", "gabriel.silva@gmail.com"),
            ("Zoe Mitchell", "zoe.mitchell@outlook.com"),
            ("Ravi Krishnan", "ravi.krishnan@gmail.com"),
            ("Emma Nielsen", "emma.nielsen@protonmail.com"),
            ("Diego Vargas", "diego.vargas@gmail.com"),
            ("Leah Cohen", "leah.cohen@icloud.com"),
            ("Finn O'Brien", "finn.obrien@yahoo.com"),
            ("Daria Volkov", "daria.volkov@gmail.com"),
            ("Caleb Turner", "caleb.turner@outlook.com"),
            ("Jasmine Wright", "jasmine.wright@gmail.com"),
            ("Liam Murphy", "liam.murphy@protonmail.com"),
            ("Ananya Gupta", "ananya.gupta@gmail.com"),
            ("Connor Miller", "connor.miller@icloud.com"),
            ("Aria Blackwood", "aria.blackwood@yahoo.com"),
            ("Sebastian Lopez", "sebastian.lopez@gmail.com"),
            ("Harper Evans", "harper.evans@outlook.com"),
            ("Maxim Kozlov", "maxim.kozlov@gmail.com"),
            ("Luna Park", "luna.park@protonmail.com")
        ]
        
        # Create users with varied stats
        for i, (name, email) in enumerate(user_data):
            user_id = f"user_{i+100}"  # Start from 100 to avoid conflicts
            points = 50 + (i * 15) + (i % 7) * 20  # Varied points between 50-800
            summaries_read = 5 + (i * 3) + (i % 5) * 8  # Varied reading counts
            today_reads = i % 6  # 0-5 reads today
            
            test_users[email] = {
                "email": email,
                "hashed_password": self._hash_password("password123"),
                "user_id": user_id,
                "name": name,
                "points": points,
                "total_summaries_read": summaries_read,
                "today_reads": today_reads,
                "followers": [],
                "following": []
            }
        
        return test_users
    
    def _hash_password(self, password):
        # Properly hash password with bcrypt
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, plain_password, hashed_password):
        # Properly verify password with bcrypt
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    
    def get_user(self, email_or_username):
        return self.users.get(email_or_username)
    
    def create_user(self, email, password, _):
        if email in self.users:
            return False
        
        self.users[email] = {
            "email": email,
            "hashed_password": self._hash_password(password),
            "user_id": f"user_{len(self.users) + 1}",
            "points": 0,
            "total_summaries_read": 0,
            "today_reads": 0,
            "followers": [],
            "following": []
        }
        return True
    
    def _load_mock_summaries(self):
        return [
            {
                "_id": "summary1",
                "title": "AI Advances in Natural Language Processing: The Next Frontier",
                "summary": "Recent advances in Natural Language Processing have fundamentally transformed the AI landscape, pushing the boundaries of what's possible with language models. New techniques for fine-tuning and efficient training have resulted in models that can understand context better and generate more coherent responses. Major breakthroughs include improved attention mechanisms, transformer architectures, and novel training methodologies that allow models to process longer contexts while maintaining computational efficiency. Researchers have developed new approaches to handle multilingual tasks, with models now capable of seamless translation between dozens of languages while preserving nuanced cultural context. The integration of multimodal capabilities has enabled AI systems to understand and generate content that combines text, images, and audio. Industry applications are expanding rapidly, from advanced chatbots that can maintain context across lengthy conversations to sophisticated code generation tools that understand programmer intent and generate complex software systems. The economic impact is substantial, with companies reporting 40-60% improvements in content creation efficiency and customer service automation. However, challenges remain in areas of bias mitigation, factual accuracy, and the responsible deployment of increasingly powerful language models.",
                "topic": "artificial intelligence",
                "date": datetime.now().isoformat(),
                "sources": ["techcrunch.com", "ai-journal.com", "nature.com", "arxiv.org"],
                "urlToImage": "https://images.unsplash.com/photo-1677442135073-0c45cd972ca1?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary2", 
                "title": "The Rise of Edge Computing: Transforming Data Processing Infrastructure",
                "summary": "Edge computing continues to gain unprecedented traction as organizations worldwide seek innovative solutions to process data closer to the source, fundamentally reshaping modern data infrastructure. This revolutionary approach significantly reduces latency, conserves precious bandwidth, and enhances privacy by keeping sensitive data local rather than transmitting it to distant cloud servers. The technology has proven particularly transformative in industries requiring real-time decision making, such as autonomous vehicles, smart manufacturing, and healthcare monitoring systems. Major tech companies are investing billions in edge infrastructure, with AWS, Microsoft, and Google establishing edge data centers in hundreds of locations globally. The integration of 5G networks has accelerated edge computing adoption, enabling ultra-low latency applications that were previously impossible. Manufacturing sectors report 30-50% reductions in operational downtime thanks to edge-based predictive maintenance systems that can analyze machine data in real-time. Smart cities are implementing edge computing for traffic management, reducing congestion by 20-35% through real-time traffic light optimization. The healthcare industry is leveraging edge AI for immediate analysis of medical imaging, enabling faster diagnoses in remote areas. However, challenges include managing distributed infrastructure complexity, ensuring consistent security across numerous edge nodes, and developing standardized protocols for seamless edge-to-cloud integration.",
                "topic": "cloud computing",
                "date": datetime.now().isoformat(),
                "sources": ["wired.com", "techradar.com", "edge-computing-news.com", "ieee.org"],
                "urlToImage": "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary3",
                "title": "Machine Learning Model Optimization: Revolutionary Breakthrough in Efficiency",
                "summary": "Groundbreaking techniques for optimizing machine learning models have demonstrated remarkable improvements in performance while dramatically reducing computational requirements, making advanced AI more accessible and efficient for real-world applications across diverse industries. Leading research institutions have developed novel approaches including dynamic neural architecture search, automated hyperparameter optimization, and innovative pruning techniques that can reduce model size by up to 90% while maintaining or even improving accuracy. The introduction of knowledge distillation methods allows smaller 'student' models to learn from larger 'teacher' models, enabling deployment of sophisticated AI on resource-constrained devices like smartphones and IoT sensors. Quantum-inspired optimization algorithms are showing promise for solving complex machine learning problems that were previously computationally intractable. Companies report 70-80% reductions in cloud computing costs when implementing these optimization techniques, while maintaining production-quality model performance. The democratization of AI through efficient models is enabling startups and smaller organizations to compete with tech giants in AI-driven innovation. Edge AI applications have expanded dramatically, with optimized models now running real-time computer vision on devices with less than 1GB of memory. However, the field faces challenges in balancing model compression with maintaining robustness, ensuring optimized models perform well across diverse real-world scenarios, and developing standardized benchmarks for comparing optimization techniques across different domains.",
                "topic": "machine learning",
                "date": datetime.now().isoformat(),
                "sources": ["arxiv.org", "ml-research.com", "nature-machine-intelligence.com", "openai.com"],
                "urlToImage": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary4",
                "title": "Semiconductor Industry Revolution: Next-Generation Manufacturing Breakthroughs",
                "summary": "The semiconductor industry is experiencing a transformative period with revolutionary manufacturing processes and advanced materials engineering enabling the production of more powerful and energy-efficient processors for applications ranging from smartphones to massive data centers. Leading foundries like TSMC, Samsung, and Intel have made significant breakthroughs in extreme ultraviolet (EUV) lithography, enabling the mass production of 3-nanometer chips with unprecedented transistor density and performance characteristics. Novel materials including gallium arsenide, silicon carbide, and emerging 2D materials like graphene are being integrated into next-generation chip designs, offering superior electrical properties and thermal management capabilities. The industry is addressing the physical limits of Moore's Law through innovative 3D chip architectures, chiplet designs, and advanced packaging technologies that allow multiple specialized processors to work together seamlessly. Artificial intelligence is being extensively deployed in semiconductor manufacturing, with machine learning algorithms optimizing production yields, predicting equipment failures, and ensuring quality control across complex fabrication processes. The geopolitical implications are substantial, with nations investing heavily in domestic semiconductor capabilities to reduce dependence on global supply chains. Automotive semiconductors have become a critical focus area, with the transition to electric vehicles driving demand for power management chips, battery controllers, and advanced driver assistance systems. However, the industry faces significant challenges including skyrocketing development costs, with new fab facilities requiring investments exceeding $20 billion, and the need for highly specialized talent in an increasingly competitive global market.",
                "topic": "semiconductors",
                "date": datetime.now().isoformat(),
                "sources": ["semiconductor-today.com", "ieee.org", "tsmc.com", "semiconductor-digest.com"],
                "urlToImage": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary5",
                "title": "Startup Ecosystem Renaissance: Venture Capital and Innovation Trends",
                "summary": "The global startup ecosystem is experiencing a remarkable renaissance, with venture capital funding continuing to flow into promising early-stage companies, particularly those focused on artificial intelligence, climate technology, and healthcare innovations that address critical societal challenges. This quarter has witnessed several landmark funding rounds, including multiple unicorn births in sectors ranging from fintech to biotechnology, demonstrating investor confidence in transformative business models. Climate tech startups are attracting unprecedented attention, with companies developing carbon capture technologies, renewable energy solutions, and sustainable agriculture practices securing billion-dollar valuations. The healthcare innovation sector has seen explosive growth, particularly in digital therapeutics, personalized medicine, and AI-powered diagnostic tools that promise to revolutionize patient care and reduce healthcare costs globally. Emerging markets are playing an increasingly important role in the global startup landscape, with India, Southeast Asia, and Latin America producing numerous successful companies that are expanding internationally. The integration of blockchain technology and cryptocurrency has created entirely new categories of startups, from decentralized finance platforms to NFT marketplaces, though regulatory uncertainty continues to create both opportunities and challenges. Remote work technologies, accelerated by the global pandemic, have matured into sophisticated platforms that are reshaping how businesses operate and collaborate across geographical boundaries. However, the startup ecosystem faces significant headwinds including increased competition for talent, rising operational costs, and the need to demonstrate sustainable business models in an environment where investor patience for unprofitable growth is diminishing.",
                "topic": "startups",
                "date": datetime.now().isoformat(),
                "sources": ["crunchbase.com", "techcrunch.com", "venturebeat.com", "pitchbook.com"],
                "urlToImage": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary6",
                "title": "Modern JavaScript Framework Evolution: Performance and Developer Experience",
                "summary": "The JavaScript ecosystem continues its rapid evolution with groundbreaking frameworks and sophisticated development tools that are revolutionizing web development efficiency and application performance across the entire development lifecycle. Recent updates to popular frameworks including React, Vue.js, and Angular have introduced powerful new features for enhanced performance optimization, improved developer experience, and better accessibility compliance. The emergence of meta-frameworks like Next.js, Nuxt.js, and SvelteKit has transformed how developers approach full-stack web development, providing integrated solutions for server-side rendering, static site generation, and API development within unified development environments. WebAssembly integration has opened new possibilities for running high-performance applications in browsers, enabling complex computational tasks and porting of existing C/C++ codebases to web platforms with near-native performance. The rise of micro-frontends architecture is enabling large organizations to develop and deploy web applications as composable, independently deployable modules, improving development team autonomy and application scalability. TypeScript adoption has reached critical mass, with major frameworks providing first-class TypeScript support and developers reporting significant improvements in code quality and maintainer productivity. Modern build tools like Vite, esbuild, and Turbopack are dramatically reducing development iteration times, with some tools offering hot module replacement that updates code changes in under 50 milliseconds. However, the rapid pace of change presents challenges including framework fatigue among developers, the complexity of keeping dependencies updated and secure, and the need for continuous learning to stay current with best practices in an ever-evolving ecosystem.",
                "topic": "programming languages",
                "date": datetime.now().isoformat(),
                "sources": ["javascript.com", "dev.to", "mozilla.org", "github.com"],
                "urlToImage": "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary7",
                "title": "Web Development Revolution: Performance, Accessibility, and User Experience",
                "summary": "Modern web development has entered a transformative era that emphasizes performance optimization, universal accessibility, and exceptional user experience across all devices and platforms, fundamentally changing how developers approach building web applications. Advanced performance optimization techniques including code splitting, lazy loading, and intelligent caching strategies are enabling web applications to load and run with speeds comparable to native mobile applications. The widespread adoption of Progressive Web App (PWA) technologies allows web applications to provide offline functionality, push notifications, and app-like experiences while maintaining the accessibility and discoverability advantages of the web. Core Web Vitals have become critical metrics that directly impact search engine rankings, forcing developers to prioritize user-centric performance measures including loading speed, interactivity, and visual stability. Accessibility has evolved from an afterthought to a fundamental requirement, with new tools and frameworks providing automated accessibility testing, semantic HTML generation, and compliance verification for international accessibility standards. The rise of headless CMS architectures and JAMstack (JavaScript, APIs, Markup) development approaches is enabling developers to create faster, more secure, and more scalable web experiences by decoupling content management from presentation layers. Modern CSS capabilities including Grid, Flexbox, and CSS Variables have eliminated the need for many external frameworks while providing more powerful and flexible layout options. The integration of artificial intelligence in web development tools is automating routine tasks including code generation, bug detection, and performance optimization, allowing developers to focus on higher-level architectural decisions and user experience design.",
                "topic": "web development",
                "date": datetime.now().isoformat(),
                "sources": ["webdev.com", "smashingmagazine.com", "css-tricks.com", "a11y.com"],
                "urlToImage": "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary8",
                "title": "Software Engineering Excellence: DevOps, Testing, and Architectural Innovation",
                "summary": "The software engineering discipline continues to mature with revolutionary methodologies and sophisticated practices for building reliable, scalable, and maintainable systems that can handle modern application demands and complexity. Advanced DevOps practices including infrastructure as code, automated deployment pipelines, and comprehensive monitoring solutions are enabling development teams to deliver software faster while maintaining high quality and system reliability. The adoption of microservices architecture has reached mainstream acceptance, with organizations successfully decomposing monolithic applications into manageable, independently deployable services that can scale according to specific business needs. Container orchestration platforms like Kubernetes have become essential infrastructure components, providing automated deployment, scaling, and management of containerized applications across hybrid and multi-cloud environments. Testing strategies have evolved beyond traditional unit and integration testing to include chaos engineering, property-based testing, and AI-powered test generation that can identify edge cases and potential failure scenarios. The emergence of observability platforms provides unprecedented insights into application behavior, system performance, and user experience through distributed tracing, metrics collection, and intelligent alerting systems. Site Reliability Engineering (SRE) practices are becoming standard across the industry, with teams establishing service level objectives, error budgets, and automated incident response procedures that balance feature development with system stability. However, the increasing complexity of modern software systems presents challenges including managing technical debt, ensuring security across distributed architectures, and maintaining team productivity as codebases and infrastructure grow in sophistication.",
                "topic": "software engineering",
                "date": datetime.now().isoformat(),
                "sources": ["software-engineering.org", "acm.org", "devops.com", "sre.google"],
                "urlToImage": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary9",
                "title": "Cybersecurity Evolution: Advanced Threats and Innovative Defense Strategies",
                "summary": "The cybersecurity landscape is experiencing rapid transformation as digital threats evolve in sophistication and scale, prompting security professionals to develop innovative strategies and technologies to protect organizations and individuals from increasingly complex malicious activities. Advanced persistent threats (APTs) are leveraging artificial intelligence and machine learning to create more targeted and evasive attacks that can bypass traditional security measures, requiring next-generation detection and response capabilities. Zero-trust security architectures have become essential for modern organizations, implementing the principle of 'never trust, always verify' across all network access points, user identities, and device connections. The rise of cloud-native security solutions is addressing the unique challenges of protecting distributed applications and data across multiple cloud platforms, with new tools for container security, serverless function protection, and cloud workload monitoring. Quantum computing represents both a significant threat and opportunity for cybersecurity, with researchers developing quantum-resistant encryption algorithms while preparing for the eventual obsolescence of current cryptographic methods. The integration of artificial intelligence in cybersecurity is enabling automated threat detection, behavioral analysis, and incident response that can identify and neutralize threats faster than human security teams. Supply chain security has emerged as a critical concern, with organizations implementing comprehensive measures to verify the integrity of software dependencies, hardware components, and third-party services. However, the cybersecurity industry faces significant challenges including a global shortage of skilled security professionals, the increasing cost and complexity of maintaining comprehensive security postures, and the need to balance security requirements with user convenience and business productivity.",
                "topic": "cybersecurity",
                "date": datetime.now().isoformat(),
                "sources": ["cybersecurity.com", "security-magazine.com", "sans.org", "nist.gov"],
                "urlToImage": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary10",
                "title": "Data Science Revolution: Advanced Analytics and Machine Learning Applications",
                "summary": "Data science continues to find transformative applications across diverse industries, from healthcare and finance to entertainment and manufacturing, with new analytical tools and machine learning techniques making it easier to extract actionable insights from increasingly large and complex datasets. Advanced machine learning algorithms including deep learning, reinforcement learning, and federated learning are enabling organizations to solve previously intractable problems while maintaining data privacy and security requirements. The healthcare industry is experiencing a data science revolution, with predictive analytics being used for early disease detection, personalized treatment recommendations, and drug discovery acceleration that could reduce pharmaceutical development timelines by years. Financial services are leveraging sophisticated algorithms for fraud detection, algorithmic trading, and risk assessment, with some institutions reporting 90% improvements in fraud detection accuracy while reducing false positives. The integration of real-time data processing capabilities is enabling organizations to make instantaneous decisions based on streaming data from IoT sensors, social media feeds, and transactional systems. AutoML platforms are democratizing machine learning by enabling domain experts without extensive programming knowledge to build and deploy sophisticated predictive models for their specific business problems. The emergence of explainable AI techniques is addressing the 'black box' problem in machine learning, providing interpretable insights into model decisions that are crucial for regulated industries and high-stakes applications. However, the field faces ongoing challenges including data quality and bias issues, the need for interdisciplinary collaboration between technical and domain experts, and the ethical implications of automated decision-making systems that can impact human lives and opportunities.",
                "topic": "data science",
                "date": datetime.now().isoformat(),
                "sources": ["datascience.com", "kdnuggets.com", "towards-data-science.com", "kaggle.com"],
                "urlToImage": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1032&auto=format&fit=crop"
            }
        ]

# Initialize mock database
db = MockDB()

# Token models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Create token function
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    # JSON can't serialize datetime objects directly; convert to ISO string
    to_encode.update({"exp": expire.isoformat()})
    # In a real app, we'd use JWT, but for mock we'll just encode/decode with json
    token = json.dumps(to_encode)
    return token

def decode_token(token: str):
    try:
        payload = json.loads(token)
        username = payload.get("sub")
        if username is None:
            return None
        return username
    except:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    username = decode_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.get_user(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Mock backend is running"}

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    
    user = db.get_user(form_data.username)
    if not user:
        logger.warning(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not db.verify_password(form_data.password, user["hashed_password"]):
        logger.warning(f"Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username},
        expires_delta=access_token_expires
    )
    
    logger.info(f"Login successful for user: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}

class UserCreate(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
async def register(user: UserCreate):
    logger.info(f"Registration attempt for user: {user.email}")
    
    if db.get_user(user.email):
        logger.warning(f"User already exists: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    success = db.create_user(user.email, user.password, user.email)
    if not success:
        logger.error(f"Failed to create user: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    logger.info(f"Registration successful for user: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    logger.info(f"Getting user info for: {current_user['email']}")
    return {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "points": current_user["points"],
        "total_summaries_read": current_user["total_summaries_read"],
        "today_reads": current_user["today_reads"]
    }

@app.get("/api/summaries/today")
async def get_todays_summaries():
    logger.info("Getting today's summaries")
    return db.summaries

@app.post("/api/summaries/generate")
async def generate_summaries(current_user: dict = Depends(get_current_user)):
    """Mock endpoint to simulate generating new summaries"""
    logger.info(f"Manually generating summaries requested by: {current_user['email']}")
    
    # For the simple server, we'll just add a new mock summary
    new_summary = {
        "_id": f"summary{len(db.summaries) + 1}",
        "title": "Latest Developments in Blockchain Technology",
        "summary": "New blockchain protocols are enabling faster transactions and lower energy consumption. These advancements are making blockchain more viable for everyday applications beyond cryptocurrency.",
        "topic": "Blockchain",
        "date": datetime.now().isoformat(),
        "sources": ["coindesk.com", "blockchain-journal.com"],
        "urlToImage": "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1032&auto=format&fit=crop"
    }
    
    db.summaries.append(new_summary)
    
    return {
        "success": True,
        "message": f"Successfully generated a new summary (total: {len(db.summaries)})",
        "count": len(db.summaries)
    }

@app.get("/api/summaries/{summary_id}")
async def get_summary(summary_id: str):
    logger.info(f"Getting summary: {summary_id}")
    for summary in db.summaries:
        if summary["_id"] == summary_id:
            return summary
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Summary not found"
    )

@app.get("/api/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    logger.info("Getting user list")
    
    # Create mock user list for discovery
    user_list = []
    for username, user in db.users.items():
        if user["user_id"] != current_user["user_id"]:  # Don't include current user
            user_list.append({
                "user_id": user["user_id"],
                "email": user["email"],
                "points": user["points"],
                "total_summaries_read": user["total_summaries_read"],
                "follower_count": len(user.get("followers", [])),
                "following_count": len(user.get("following", [])),
                "created_at": datetime.now().isoformat()
            })
    
    return {"users": user_list}

@app.get("/api/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    logger.info(f"Getting dashboard for user: {current_user['email']}")
    
    # Mock analytics data with the structure expected by frontend
    return {
        "user": current_user,
        "analytics": {
            "total_points": current_user.get("points", 150),
            "total_reads": current_user.get("total_summaries_read", 24),
            "total_summaries_read": current_user.get("total_summaries_read", 24),
            "avg_daily_reads": 3.2,
            "avg_weekly_reads": 22.4,
            "user_name": current_user["email"].split("@")[0],
            "reading_streak": {
                "current": 7,
                "longest": 14
            },
            "weekly_activity": [4, 2, 6, 3, 5, 1, 4],
            "most_active_time": {
                "hour": 14,
                "description": "2:00 PM"
            },
            "daily_read_log": {
                "2024-08-09": 3,
                "2024-08-10": 5,
                "2024-08-11": 2,
                "2024-08-12": 4,
                "2024-08-13": 6,
                "2024-08-14": 3,
                "2024-08-15": 4
            },
            "top_topics": [
                {"name": "Technology", "value": 35, "color": "#8b5cf6"},
                {"name": "Science", "value": 25, "color": "#06b6d4"},
                {"name": "Business", "value": 20, "color": "#10b981"},
                {"name": "Politics", "value": 20, "color": "#f59e0b"}
            ],
            "reading_trend": [
                {"date": "2024-01-01", "reads": 3},
                {"date": "2024-01-02", "reads": 5},
                {"date": "2024-01-03", "reads": 2},
                {"date": "2024-01-04", "reads": 4},
                {"date": "2024-01-05", "reads": 6},
                {"date": "2024-01-06", "reads": 3},
                {"date": "2024-01-07", "reads": 4}
            ],
            "badges": [
                {"name": "Early Reader", "icon": "🌅", "earned_date": "2024-08-01"},
                {"name": "Tech Explorer", "icon": "💻", "earned_date": "2024-08-05"},
                {"name": "Streak Master", "icon": "🔥", "earned_date": "2024-08-10"}
            ]
        },
        "recent_activity": []
    }

@app.get("/api/user/{user_id}/profile")
async def get_user_profile(user_id: str, current_user: dict = Depends(get_current_user)):
    logger.info(f"Getting profile for user: {user_id}")
    
    # Find user by user_id
    for email, user in db.users.items():
        if user["user_id"] == user_id:
            # Check if this is the current user's own profile
            is_self = current_user["user_id"] == user_id
            
            # Mock follow status (in real app, check follow relationships)
            is_following = not is_self and user_id != current_user["user_id"]
            
            return {
                "user": {
                    "user_id": user["user_id"],
                    "email": user["email"],
                    "points": user["points"],
                    "total_summaries_read": user["total_summaries_read"],
                    "follower_count": len(user.get("followers", [])),
                    "following_count": len(user.get("following", [])),
                    "created_at": datetime.now().isoformat(),
                    "is_self": is_self,
                    "is_following": is_following,
                    "reading_streak": {
                        "current": 7,
                        "longest": 14
                    },
                    "top_topics": [
                        {"name": "Technology", "count": 15},
                        {"name": "Science", "count": 8},
                        {"name": "Business", "count": 5}
                    ],
                    "recent_activity": [
                        {
                            "type": "read_summary",
                            "title": "Latest AI Developments",
                            "date": datetime.now().isoformat(),
                            "points_earned": 10
                        },
                        {
                            "type": "reading_streak",
                            "description": "7 day reading streak!",
                            "date": (datetime.now() - timedelta(days=1)).isoformat(),
                            "points_earned": 25
                        }
                    ]
                }
            }
    
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/users/discover")
async def discover_users(current_user: dict = Depends(get_current_user)):
    logger.info(f"Getting discovery users for: {current_user['email']}")
    
    # Return all users except current user
    users_list = []
    for email, user in db.users.items():
        if user["user_id"] != current_user["user_id"]:
            users_list.append({
                "user_id": user["user_id"],
                "email": user["email"],
                "name": user.get("name", user["email"].split("@")[0]),
                "points": user["points"],
                "total_summaries_read": user["total_summaries_read"],
                "follower_count": len(user.get("followers", [])),
                "following_count": len(user.get("following", [])),
                "is_following": False  # Mock - in real app check relationships
            })
    
    # Sort by points descending
    users_list.sort(key=lambda x: x["points"], reverse=True)
    
    return {"users": users_list}

@app.get("/api/past_summaries")
async def get_past_summaries(topic: str = None, current_user: dict = Depends(get_current_user)):
    logger.info(f"Getting past summaries for topic: {topic}")
    
    # Filter summaries by topic if provided
    if topic:
        filtered_summaries = [s for s in db.summaries if s.get("topic", "").lower() == topic.lower()]
    else:
        filtered_summaries = db.summaries
    
    return {"summaries": filtered_summaries}

@app.post("/api/read_summary")
async def mark_summary_read(request: dict, current_user: dict = Depends(get_current_user)):
    summary_id = request.get("summary_id")
    logger.info(f"Marking summary {summary_id} as read for user: {current_user['email']}")
    
    # Mock implementation - in real app this would update database
    return {
        "success": True,
        "points_earned": 5,
        "total_points": current_user["points"] + 5,
        "today_reads": current_user["today_reads"] + 1,
        "total_summaries_read": current_user["total_summaries_read"] + 1,
        "already_read": False,
        "message": "Summary marked as read",
        "streak": {"current": 1, "max": 1, "updated": True}
    }

@app.post("/api/follow/{user_id}")
async def follow_user(user_id: str, current_user: dict = Depends(get_current_user)):
    logger.info(f"User {current_user['email']} following user {user_id}")
    
    # In real app, would update database relationships
    return {
        "message": "User followed successfully",
        "success": True
    }

@app.post("/api/unfollow/{user_id}") 
async def unfollow_user(user_id: str, current_user: dict = Depends(get_current_user)):
    logger.info(f"User {current_user['email']} unfollowing user {user_id}")
    
    # In real app, would update database relationships
    return {
        "message": "User unfollowed successfully", 
        "success": True
    }

@app.post("/api/ai-agent")
async def ai_agent_chat(request: dict, current_user: dict = Depends(get_current_user)):
    message = request.get("message", "").lower()
    logger.info(f"AI agent request from {current_user['email']}: {message[:50]}...")
    
    # Intelligent responses based on message content
    if "reading" in message and "habit" in message:
        response = f"Based on your profile, you've been doing great with your reading habits! You have {current_user.get('reading_streak', 0)} day reading streak. Keep up the excellent work by checking in daily for the latest tech news summaries."
    elif "summary" in message or "summaries" in message:
        response = "I can help you understand today's tech news summaries! We cover AI developments, startup funding, tech policy, cybersecurity, and emerging technologies. Which topic interests you most?"
    elif "trending" in message or "popular" in message:
        response = "The most trending topics today include AI breakthroughs, startup acquisitions, and cybersecurity updates. Check out today's summaries to dive deeper into these hot topics!"
    elif "discovery" in message or "users" in message or "connect" in message:
        response = "Want to connect with other tech enthusiasts? Check out the Discovery page to find users with similar reading interests and tech focus areas. You can follow them to see their reading activity!"
    elif "streak" in message:
        current_streak = current_user.get('reading_streak', 0)
        response = f"Your current reading streak is {current_streak} days! Reading consistently helps you stay on top of the fast-moving tech world. Keep visiting daily to maintain your streak!"
    elif "hello" in message or "hi" in message or "help" in message:
        response = "Hello! I'm Newt Copilot, your intelligent reading assistant. I can help you with your reading habits, explain today's tech summaries, suggest trending topics, or help you discover other tech enthusiasts. What would you like to know?"
    elif "points" in message or "score" in message:
        points = current_user.get('points', 0)
        response = f"You currently have {points} reading points! You earn points by reading summaries daily and maintaining your reading streak. The more consistent you are, the more points you'll accumulate!"
    else:
        response = f"That's an interesting question about '{message}'. As your reading assistant, I can help you with reading habits, tech news summaries, trending topics, user discovery, and tracking your progress. Feel free to ask me anything about your tech news reading experience!"
    
    return {
        "response": response,
        "success": True
    }

@app.post("/api/waitlist")
async def join_waitlist(request: dict):
    email = request.get("email", "").strip().lower()
    
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email address is required")
    
    logger.info(f"New waitlist signup: {email}")
    
    try:
        # Call the Node.js email service
        result = subprocess.run(
            ["node", "email_service.js", email],
            cwd=os.path.dirname(os.path.abspath(__file__)),
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            logger.info(f"Successfully sent waitlist emails for: {email}")
            return {
                "message": "Successfully joined the waitlist! Check your email for confirmation.",
                "success": True
            }
        else:
            logger.error(f"Email service failed: {result.stderr}")
            return {
                "message": "Joined the waitlist, but there was an issue sending confirmation email.",
                "success": True
            }
            
    except subprocess.TimeoutExpired:
        logger.error(f"Email service timeout for: {email}")
        return {
            "message": "Joined the waitlist, but email confirmation may be delayed.",
            "success": True
        }
    except Exception as e:
        logger.error(f"Error in waitlist signup: {str(e)}")
        return {
            "message": "Successfully joined the waitlist!",
            "success": True
        }

# Main function to run the server
if __name__ == "__main__":
    logger.info("Starting AI News Summarizer mock backend server")
    uvicorn.run(app, host="0.0.0.0", port=5001)
