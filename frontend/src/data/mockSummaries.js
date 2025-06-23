// Mock data for use when backend is unavailable
export const mockSummaries = {
  'machine learning': [
    {
      _id: 'ml1',
      topic: 'machine learning',
      title: 'Advancements in Deep Learning',
      summary: 'Recent breakthroughs in deep learning models have shown remarkable performance in complex tasks. Researchers at leading AI labs have developed neural networks that can understand context and relationships between concepts with unprecedented accuracy. These models are now being applied to healthcare diagnostics, where they\'re helping identify patterns in medical images that human doctors might miss.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://www.nature.com/articles/s41591-023-12345-5',
        'https://www.sciencedaily.com/releases/2025/06/250622104523.htm',
        'https://arxiv.org/abs/2506.12345'
      ]
    }
  ],
  'semiconductors': [
    {
      _id: 'semi1',
      topic: 'semiconductors',
      title: 'Next-Generation Chip Manufacturing',
      summary: 'The semiconductor industry is entering a new era with 2nm process nodes now reaching mass production. Major chip manufacturers are investing billions in new facilities across the US, Europe, and Asia. These advanced chips deliver 30% power efficiency improvements and 45% performance gains over previous generations, critical for AI workloads and mobile devices. Supply chain concerns have prompted more geographically diverse manufacturing capabilities.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://www.eetimes.com/2nm-chips-enter-production/',
        'https://www.semiconductors.org/global-expansion-2025/',
        'https://www.tomshardware.com/news/next-gen-chip-performance'
      ]
    }
  ],
  'startups': [
    {
      _id: 'start1',
      topic: 'startups',
      title: 'Climate Tech Startups Gaining Momentum',
      summary: 'Climate tech startups raised record funding in Q2 2025, with investors pouring $15.2 billion into the sector. Carbon capture technologies and sustainable battery innovations lead the pack, with several startups reaching unicorn status. Emerging business models that combine hardware, software, and service components are proving particularly attractive to venture capitalists seeking both impact and returns.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://techcrunch.com/2025/06/20/climate-tech-funding-boom/',
        'https://www.cnbc.com/2025/06/22/green-unicorns-rise.html',
        'https://venturebeat.com/sustainability/carbon-capture-startups'
      ]
    }
  ],
  'programming languages': [
    {
      _id: 'prog1',
      topic: 'programming languages',
      title: 'Rust Continues Its Rise',
      summary: 'Rust has cemented its position as the fastest-growing programming language in enterprise environments. The memory-safe language saw a 48% increase in adoption over the past year, with major tech companies migrating critical infrastructure components from C++ to Rust. Developer surveys highlight its performance, safety guarantees, and increasingly mature ecosystem as key factors driving its popularity.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://stackoverflow.blog/2025/06/developer-survey-results-2025',
        'https://www.rust-lang.org/production/case-studies-2025',
        'https://github.blog/2025-06-21-language-adoption-trends'
      ]
    }
  ],
  'web development': [
    {
      _id: 'web1',
      topic: 'web development',
      title: 'WebAssembly Transforms Frontend Development',
      summary: 'WebAssembly is revolutionizing web development by enabling high-performance applications directly in browsers. The new component model standard has been finalized, allowing developers to build, share, and compose WebAssembly modules in a language-agnostic way. Major frameworks are integrating WASM by default, and browser support for garbage collection has eliminated key performance bottlenecks.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://developer.mozilla.org/blog/wasm-component-model-2025',
        'https://www.webassembly.org/roadmap-2025-complete',
        'https://v8.dev/blog/wasm-gc-support'
      ]
    }
  ],
  'artificial intelligence': [
    {
      _id: 'ai1',
      topic: 'artificial intelligence',
      title: 'Multimodal AI Systems Reach New Milestones',
      summary: 'Multimodal AI systems that integrate vision, language, and audio capabilities have achieved remarkable breakthroughs. The latest models demonstrate advanced reasoning across multiple sensory inputs, allowing for more natural human-AI interaction. These systems are finding applications in healthcare diagnostics, educational tools, and creative industries, though researchers emphasize the continuing need for responsible deployment and oversight.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://ai.googleblog.com/2025/06/advances-multimodal-perception',
        'https://openai.com/research/multimodal-reasoning-2025',
        'https://www.technologyreview.com/2025/06/21/multimodal-ai-applications'
      ]
    }
  ],
  'software engineering': [
    {
      _id: 'eng1',
      topic: 'software engineering',
      title: 'AI-Assisted Development Tools Transforming Software Engineering',
      summary: 'AI-assisted development tools have fundamentally changed software engineering practices, with 78% of professional developers now using AI coding assistants daily. Beyond code completion, these tools now help with architectural decision-making, automated testing, and security vulnerability detection. Companies report productivity increases of 35-50%, though challenges remain around ensuring code quality and maintaining developer core skills.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://www.github.com/blog/productivity-report-2025',
        'https://devsurvey.stackexchange.com/2025-ai-tools',
        'https://www.ieee.org/software/state-of-ai-development-2025'
      ]
    }
  ],
  'cloud computing': [
    {
      _id: 'cloud1',
      topic: 'cloud computing',
      title: 'Edge-Cloud Integration Reshaping Infrastructure',
      summary: 'The line between cloud and edge computing continues to blur as major providers introduce seamless integration solutions. New services automatically optimize workload placement between centralized data centers and distributed edge nodes based on latency requirements, data sovereignty rules, and cost considerations. This approach is enabling real-time applications in retail, manufacturing, and autonomous systems while reducing bandwidth costs by up to 60%.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://aws.amazon.com/blogs/architecture/edge-cloud-continuum',
        'https://azure.microsoft.com/blog/2025/edge-cloud-solutions',
        'https://cloud.google.com/blog/products/infrastructure/edge-computing-advancements'
      ]
    }
  ],
  'cybersecurity': [
    {
      _id: 'sec1',
      topic: 'cybersecurity',
      title: 'Quantum-Resistant Encryption Becomes Standard',
      summary: 'As quantum computing advances accelerate, organizations are rapidly transitioning to quantum-resistant encryption protocols. NIST\'s post-quantum cryptography standards have been finalized, and major cloud providers, financial institutions, and government agencies are implementing these algorithms across their systems. Security experts emphasize that the transition must happen now, as "harvest now, decrypt later" attacks target data with long-term value.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://www.nist.gov/news-events/news/2025/06/post-quantum-standards-finalized',
        'https://www.wired.com/story/quantum-encryption-transition-2025',
        'https://www.darkreading.com/quantum/financial-sector-leads-pqc-adoption'
      ]
    }
  ],
  'data science': [
    {
      _id: 'data1',
      topic: 'data science',
      title: 'Synthetic Data Revolutionizing Machine Learning',
      summary: 'Synthetic data generation has matured into a critical tool for data science teams, addressing privacy concerns and data scarcity issues. Advanced generative AI models can now create statistically representative datasets that preserve complex relationships while eliminating personal information. Healthcare and financial services are leading adoption, using synthetic data to train models on sensitive scenarios without exposing customer information.',
      timestamp: '2025-06-23T00:00:00.000Z',
      sources: [
        'https://www.nature.com/articles/s41597-025-0712-6',
        'https://blogs.nvidia.com/blog/synthetic-data-revolution',
        'https://www.kaggle.com/synthetic-data-benchmark-2025'
      ]
    }
  ]
};

// For past summaries, create copies with older timestamps
export const mockPastSummaries = Object.entries(mockSummaries).reduce((acc, [topic, summaries]) => {
  // Create 5 past summaries for each topic, with dates going back 5 days
  acc[topic] = Array(5).fill(null).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i + 1)); // Go back i+1 days
    
    return {
      ...summaries[0],
      _id: `${summaries[0]._id}-past-${i}`,
      timestamp: date.toISOString(),
      title: `${i+1} Day${i > 0 ? 's' : ''} Ago: ${summaries[0].title}`
    };
  });
  return acc;
}, {});
