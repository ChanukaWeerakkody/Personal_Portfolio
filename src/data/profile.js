// Single source of truth for all portfolio content. Edit here; every section, the AI assistant,
// the skill matcher and the terminal read from this file.

export const profile = {
  name: 'Chanuka Weerakkody',
  role: 'Backend-Focused Software Engineer',
  location: 'Colombo, Sri Lanka',
  timezone: 'Asia/Colombo',
  email: 'chanuka.weerakkody123@gmail.com',
  phone: '+94 76 947 5434',
  github: 'chanukaweerakkody',
  githubUrl: 'https://github.com/chanukaweerakkody',
  linkedin: 'https://www.linkedin.com/in/chanuka-weerakkody',
  medium: 'https://medium.com/@chanuka.weerakkody123',
  cv: '/Chanuka_Weerakkody_CV.pdf',
  tagline: 'Building scalable systems, intelligent applications, and real-time experiences with Spring Boot, NestJS, event-driven pipelines, and production-tested cloud architecture.',
  roles: [
    'Backend-Focused Software Engineer',
    'Distributed Systems & Event-Driven Architect',
    'Spring Boot & NestJS Specialist',
    'REST API & Microservices Engineer',
    'Real-Time & AI Systems Developer',
  ],
  available: true,
};

export const stats = [
  { value: 2, suffix: '+', label: 'Years experience' },
  { value: 7, suffix: '', label: 'Key projects' },
  { value: 15, suffix: '+', label: 'Technologies' },
  { value: 7, suffix: '', label: 'Articles written' },
];

// Interactive timeline (work + education, newest first)
export const timeline = [
  { type: 'education', title: 'BSc (Hons) in Computing', org: 'Wrexham University – UK', period: '2026 – 2027', status: 'In progress', detail: 'Top-up degree building on the GDSE diploma.' },
  {
  type: 'work',
  title: 'Software Engineer',
  org: 'Aventure IT – Sri Lanka',
  period: 'Mar 2026 – Present',
  detail: 'Engineer and maintain scalable, production-grade backend systems with a strong focus on NestJS, Spring Boot, and enterprise application architecture. Design secure REST APIs, modular backend architectures, authentication and authorization workflows using JWT and RBAC, and reliable business-critical services. Optimise database queries, transaction workflows, and API performance while improving maintainability, security, and system reliability across complex applications. Contribute to backend architecture decisions, code quality, integration design, and production issue resolution.',
  tags: [
    'NestJS',
    'Spring Boot',
    'Backend Architecture',
    'REST API Design',
    'JWT',
    'RBAC',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'TypeORM',
    'Database Optimization',
    'System Maintenance',
    'Production Engineering'
  ],
},
{
  type: 'work',
  title: 'Associate Software Engineer',
  org: 'Aventure IT – Sri Lanka',
  period: 'Feb 2025 – Feb 2026',
  detail: 'Architected and maintained production-grade backend systems for enterprise SaaS and mobile applications. Developed secure REST APIs using Spring Boot, NestJS, Node.js, and PHP, implementing JWT authentication and role-based access control. Optimised MySQL queries, improved backend performance, and delivered business-critical workflows and integrations.',
  tags: [
    'Laravel',
    'NestJS',
    'Spring Boot',
    'Node.js',
    'React Native',
    'MySQL',
    'MongoDB',
    'REST APIs',
    'JWT',
    'RBAC'
  ],
},
{
  type: 'work',
  title: 'Intern Software Engineer',
  org: 'Redcode Solutions – Sri Lanka',
  period: 'Feb 2024 – Jan 2025',
  detail: 'Contributed to backend development for a fishing platform and the Busy POS system using NestJS and Spring Boot. Built REST APIs with role-based access control, developed retail business services using MongoDB and MySQL, and supported backend integration, debugging, and application reliability.',
  tags: [
    'NestJS',
    'Spring Boot',
    'React',
    'MySQL',
    'MongoDB',
    'REST APIs',
    'RBAC'
  ],
},
  { type: 'education', title: 'Graduate Diploma in Software Engineering (GDSE)', org: 'IJSE – Institute of Software Engineering', period: '2022 – 2024', detail: 'Full-stack software engineering programme.' },
  { type: 'education', title: 'GCE Advanced Level – Mathematics', org: 'Vidyarathna University College', period: '2020', detail: '' },
];

// Skills carry a level (1-5) and aliases so the AI skill matcher can reason about job descriptions.
export const skills = [
  { name: 'Java', cat: 'Languages', level: 5, aliases: ['jvm', 'j2ee', 'jakarta'] },
  { name: 'PHP', cat: 'Languages', level: 4, aliases: [] },
  { name: 'JavaScript', cat: 'Languages', level: 5, aliases: ['js', 'es6', 'ecmascript'] },
  { name: 'TypeScript', cat: 'Languages', level: 4, aliases: ['ts'] },
  { name: 'Python', cat: 'Languages', level: 3, aliases: [] },
  { name: 'Spring Boot', cat: 'Backend', level: 5, aliases: ['spring', 'spring mvc', 'spring security', 'spring cloud', 'hibernate', 'jpa'] },
  { name: 'NestJS', cat: 'Backend', level: 5, aliases: ['nest.js', 'nest'] },
  { name: 'Node.js', cat: 'Backend', level: 5, aliases: ['node', 'express', 'express.js', 'nodejs'] },
  { name: 'Laravel', cat: 'Backend', level: 4, aliases: ['eloquent'] },
  { name: 'MySQL', cat: 'Databases', level: 5, aliases: ['mariadb', 'sql', 'rdbms', 'relational'] },
  { name: 'PostgreSQL', cat: 'Databases', level: 4, aliases: ['postgres', 'psql'] },
  { name: 'MongoDB', cat: 'Databases', level: 4, aliases: ['mongoose', 'nosql'] },
  { name: 'Redis', cat: 'Databases', level: 4, aliases: ['cache', 'caching'] },
  { name: 'Docker', cat: 'DevOps', level: 4, aliases: ['containers', 'containerization', 'docker compose'] },
  { name: 'CI/CD', cat: 'DevOps', level: 4, aliases: ['github actions', 'jenkins', 'pipelines', 'gitlab ci'] },
  { name: 'AWS', cat: 'DevOps', level: 3, aliases: ['ec2', 's3', 'cloud'] },
  { name: 'Apache Kafka', cat: 'Architecture', level: 4, aliases: ['kafka', 'event streaming', 'event-driven', 'message queue', 'rabbitmq'] },
  { name: 'REST API Design', cat: 'Architecture', level: 5, aliases: ['rest', 'restful', 'api', 'openapi', 'swagger'] },
  { name: 'Microservices', cat: 'Architecture', level: 4, aliases: ['distributed systems', 'service-oriented'] },
  { name: 'JWT & RBAC', cat: 'Architecture', level: 5, aliases: ['jwt', 'rbac', 'auth', 'authentication', 'authorization', 'oauth', 'security'] },
  { name: 'WebSockets', cat: 'Architecture', level: 4, aliases: ['socket.io', 'realtime', 'real-time'] },
  { name: 'React', cat: 'Frontend', level: 4, aliases: ['react.js', 'reactjs', 'redux', 'next.js', 'nextjs'] },
  { name: 'React Native', cat: 'Frontend', level: 3, aliases: ['mobile', 'android', 'ios'] },
  { name: 'Git', cat: 'Tools', level: 5, aliases: ['github', 'version control'] },
  { name: 'JUnit', cat: 'Tools', level: 4, aliases: ['testing', 'unit testing', 'jest', 'tdd'] },
  { name: 'Postman', cat: 'Tools', level: 5, aliases: ['api testing'] },
];

export const projects = [
  {
    id: 'crypto-terminal',
    title: 'Real-Time Crypto Market Terminal',
    year: 2026,
    featured: true,
    category: 'Real-time',
    description: 'Event-driven market data pipeline: KafkaJS producer → Aiven Cloud Kafka → Socket.io fan-out to a Binance-style Chart.js dashboard, containerised with Docker.',
    challenge: 'High-throughput live market streams with near-zero-lag delivery, broker failover, and SSL/TLS-secured data pipelines.',
    solution: 'Engineered a resilient event pipeline using KafkaJS streaming live BTC tickers to an Aiven Cloud Kafka cluster. A Node.js consumer group deserializes records and fans them out through Socket.io rooms to high-frequency frontend charts.',
    metrics: [['Broker', 'Apache Kafka'], ['Transport', 'WebSockets'], ['Security', 'SSL/TLS']],
    tags: ['Apache Kafka', 'Node.js', 'WebSockets', 'Docker', 'Tailwind CSS'],
    github: 'https://github.com/ChanukaWeerakkody/kafka-crypto-project',
    githubRepoHint: 'kafka-crypto-project',
    architecture: {
      overview: 'Event-driven streaming architecture decoupling ingestion from client delivery. A KafkaJS producer ingests raw trade feeds, publishes to an encrypted Kafka topic on Aiven Cloud, and a stateless Node.js consumer group fans out real-time ticks to connected WebSocket clients.',
      databaseDesign: 'In-memory sliding window cache buffering rolling 1-minute, 5-minute, and 1-hour OHLCV candles, avoiding disk I/O bottlenecks during peak trade surges.',
      security: 'TLS 1.3 encrypted broker connections, SASL/SCRAM authentication credentials stored in isolated environment containers, and strict WebSocket origin validation.',
      scalability: 'Horizontally scalable consumer groups using Kafka partition rebalancing; WebSocket connections managed via Redis adapter across multiple node instances.',
      decisions: [
        'Used Kafka over standard Pub/Sub for persistent commit log and replayability.',
        'Implemented backpressure management in Node.js streams to prevent client memory leaks.',
        'Dockerized producer, broker bridge, and client web services with multi-stage builds.'
      ]
    }
  },
  {
    id: 'boat-fishing',
    title: 'Boat Fishing System – Fishing Platform',
    year: 2025,
    featured: true,
    category: 'Full-stack',
    description: 'A full-stack fishing platform backed by secure, scalable RESTful APIs, supporting role-based access control and reliable backend operations.',
    challenge: 'Managing multiple user roles (Admins, Vessel Owners, Inspectors), securing platform operations and maintaining reliable API communication across the fishing platform.',
    solution: 'Developed and maintained RESTful APIs using NestJS, implementing role-based access control and MySQL-based data management, integrated with a React frontend.',
    metrics: [
      ['Backend', 'NestJS'],
      ['Security', 'RBAC'],
      ['Database', 'MySQL']
    ],
    tags: [
      'NestJS',
      'TypeScript',
      'MySQL',
      'React',
      'REST API',
      'RBAC'
    ],
    github: 'https://github.com/ChanukaWeerakkody/Boat_Fishing_System',
    githubRepoHint: 'Boat Fishing System',
    architecture: {
      overview: 'Modular NestJS architecture structured into domain modules (Auth, Vessels, Trips, Inspections) adhering to Dependency Injection, Clean Layering, and custom Guard pipelines.',
      databaseDesign: 'Normalized MySQL relational schema with foreign key constraints, composite indexing on vessel registration and timestamp columns for fast inspection queries.',
      security: 'Stateless JWT authentication paired with custom NestJS ExecutionContext Guards enforcing strict Role-Based Access Control (RBAC) across protected endpoints.',
      scalability: 'TypeORM connection pooling with read-optimized repository queries; structured error interceptors and request validation pipes.',
      decisions: [
        'Adopted NestJS for enterprise TypeScript type-safety and structured modular boundaries.',
        'Centralized request validation using class-validator DTOs preventing malformed payloads.',
        'Applied database transactions for trip dispatch and catch inspection logs.'
      ]
    }
  },
  {
    id: 'sc-graphic',
    title: 'SC Graphic – Resin Art & Printing Platform',
    year: 2025,
    featured: false,
    category: 'E-commerce',
    description: 'E-commerce backend with secure REST APIs for authentication, catalogue management and order processing.',
    challenge: 'Granular authentication plus fast product catalogue retrieval across customized resin art variations.',
    solution: 'Spring Security with JWT validation and optimised relational schemas for the ordering flow.',
    metrics: [['Security', 'Spring Security'], ['Database', 'MySQL'], ['Auth', 'JWT']],
    tags: ['Spring Boot', 'Spring Security', 'React', 'MySQL'],
    github: 'https://github.com/ChanukaWeerakkody?tab=repositories&q=SC%20Graphic',
    githubRepoHint: 'SC Graphic',
    architecture: {
      overview: 'Layered Spring Boot MVC backend utilizing Controller-Service-Repository architecture with Spring Data JPA and Hibernate ORM.',
      databaseDesign: 'Relational MySQL schema with separate tables for product variants, custom printing specifications, orders, and customer profiles with foreign key integrity.',
      security: 'Spring Security filter chain with custom OncePerRequestFilter for Bearer JWT verification, BCrypt password hashing, and CORS configuration.',
      scalability: 'JPA lazy loading and pagination on catalogue endpoints reducing database load during high traffic.',
      decisions: [
        'Decoupled image storage from relational records, referencing CDN URLs.',
        'Used declarative transactional management (@Transactional) for order checkout.'
      ]
    }
  },
  {
    id: 'i-mobile-crazy',
    title: 'I Mobile Crazy – Mobile Commerce Platform',
    year: 2025,
    featured: false,
    category: 'E-commerce',
    description: 'Scalable backend for a mobile-phone marketplace with RBAC, secure order management and protected product APIs.',
    challenge: 'Secure transaction workflows and role-based authorisation for multi-user inventory and orders.',
    solution: 'Custom RBAC security filters and transactional boundaries on Spring Boot + MySQL.',
    metrics: [['Access', 'Strict RBAC'], ['Orders', 'ACID'], ['Schema', 'Relational']],
    tags: ['Spring Boot', 'Spring Security', 'React', 'MySQL'],
    github: 'https://github.com/ChanukaWeerakkody?tab=repositories&q=I%20Mobile%20Crazy',
    githubRepoHint: 'I Mobile Crazy',
    architecture: {
      overview: 'Enterprise Spring Boot microservice design with robust inventory synchronization, transactional order processing, and decoupled reporting services.',
      databaseDesign: 'ACID-compliant MySQL relational database with row-level locking on inventory allocation during concurrent checkout sessions.',
      security: 'Role-based authorization distinguishing Customer, Staff, and Administrator privilege tiers using Spring Security Method Security (@PreAuthorize).',
      scalability: 'Optimized SQL execution plans with composite indexes on category and price filters; connection pool fine-tuning using HikariCP.',
      decisions: [
        'Implemented pessimistic locking on critical stock quantities to prevent overselling.',
        'Structured REST contracts with OpenAPI / Swagger documentation.'
      ]
    }
  },
  {
    id: 'mediplus',
    title: 'Mediplus – Healthcare Locator App',
    year: 2024,
    featured: false,
    category: 'Mobile',
    description: 'React Native app that locates nearby hospitals and Ayurvedic centres in real time via the Google Location API.',
    challenge: 'Filtering nearby medical facilities dynamically from live device coordinates with minimal battery consumption.',
    solution: 'Optimised geo-queries with the Google Location API and smooth React Native render cycles.',
    metrics: [['Location', 'Real-time'], ['Platform', 'iOS / Android'], ['API', 'Google Maps']],
    tags: ['React Native', 'Google Location API', 'REST API'],
    github: 'https://github.com/ChanukaWeerakkody?tab=repositories&q=Mediplus',
    githubRepoHint: 'Mediplus',
    architecture: {
      overview: 'Cross-platform mobile client consuming geospatial REST services with local caching and offline fallback capabilities.',
      databaseDesign: 'Geospatial coordinates and facility metadata with cached radius boundaries for low-latency client retrieval.',
      security: 'API key restriction by SHA-1 fingerprint and package name, SSL pinning on HTTP requests.',
      scalability: 'Debounced location listeners preventing unnecessary reverse-geocoding calls and preserving mobile battery life.',
      decisions: [
        'Implemented local state management with AsyncStorage caching previous facility queries.',
        'Used asynchronous native geolocation modules for non-blocking UI rendering.'
      ]
    }
  },
  {
    id: 'edu-zone',
    title: 'Edu Zone – Learning Management System',
    year: 2024,
    featured: false,
    category: 'Full-stack',
    description: 'Full-stack LMS with course browsing, purchase flows, progress tracking and certification.',
    challenge: 'Student progress state, course content delivery and seamless checkout across varied multimedia modules.',
    solution: 'Unified MERN backend with indexed MongoDB documents and JWT-protected sessions.',
    metrics: [['Stack', 'MERN'], ['Auth', 'JWT'], ['Storage', 'MongoDB']],
    tags: ['MongoDB', 'Express.js', 'React', 'Node.js'],
    github: 'https://github.com/ChanukaWeerakkody?tab=repositories&q=Edu%20Zone',
    githubRepoHint: 'Edu Zone',
    architecture: {
      overview: 'MERN stack architecture with Express.js REST API layer, Mongoose document models, and React single-page client.',
      databaseDesign: 'Document-oriented MongoDB schemas using embedded subdocuments for lesson progress and references for course enrollment indices.',
      security: 'Bcrypt password encryption, HTTP-only cookie JWT transport, input sanitization against NoSQL injection.',
      scalability: 'Compound index on student ID and course ID; aggregation pipelines for calculating overall course completion percentages.',
      decisions: [
        'Selected MongoDB for dynamic lesson schema flexibility across quizzes, text, and video.',
        'Used Express middleware pipeline for centralized error handling and audit logging.'
      ]
    }
  },
  {
    id: 'next-travel',
    title: 'Next Travel – Travel Booking Platform',
    year: 2024,
    featured: true,
    category: 'Microservices',
    description: 'Microservices booking platform for hotels, vehicles and tour guides with end-to-end reservation management.',
    challenge: 'Decoupling monolithic booking logic into independent, fault-tolerant services.',
    solution: 'Independent Spring Boot services communicating over REST with centralised configuration and dedicated database schemas.',
    metrics: [['Architecture', 'Microservices'], ['Scope', 'End-to-end'], ['DB', 'MySQL']],
    tags: ['Spring Boot', 'MySQL', 'Microservices'],
    github: 'https://github.com/ChanukaWeerakkody/Next_Travel_Web_Application',
    githubRepoHint: 'Next Travel',
    architecture: {
      overview: 'Service-Oriented Architecture (SOA) dividing Travel Booking into Hotel Service, Vehicle Service, Guide Service, User Service, and Booking Coordinator.',
      databaseDesign: 'Database-per-service pattern with dedicated MySQL instances preventing tight coupling and enabling independent schema evolution.',
      security: 'Centralized authentication token verification with mutual API authorization headers.',
      scalability: 'Independent service deployability; non-blocking HTTP client communication with fallback mechanisms.',
      decisions: [
        'Enforced Database-per-service pattern to eliminate shared database deadlocks.',
        'Designed idempotent reservation endpoints to prevent duplicate hotel/car bookings.'
      ]
    }
  },
  {
    id: 'metaflix',
    title: 'MetaFlix – Film Streaming Platform',
    year: 2023,
    featured: false,
    category: 'E-commerce',
    description: 'Secure film download platform with user authentication and content-delivery APIs.',
    challenge: 'Protecting downloadable content behind authenticated, role-aware APIs.',
    solution: 'Spring Boot + Spring Security delivery APIs with token-based access and byte-range streaming.',
    metrics: [['Security', 'Spring Security'], ['Delivery', 'REST'], ['DB', 'MySQL']],
    tags: ['Spring Boot', 'Spring Security', 'React', 'MySQL'],
    github: 'https://github.com/ChanukaWeerakkody?tab=repositories&q=MetaFlix',
    githubRepoHint: 'MetaFlix',
    architecture: {
      overview: 'Spring Boot media-serving backend with layered service boundaries, token verification, and chunked media stream handling.',
      databaseDesign: 'Relational catalog mapping films, genres, user purchase receipts, and subscription validity periods.',
      security: 'Expiring tokenized download URLs preventing unauthorized link sharing.',
      scalability: 'Partial content response support (HTTP 206) for smooth seeking and reduced server memory overhead.',
      decisions: [
        'Used streaming responses rather than loading complete media files into RAM.',
        'Maintained separate audit tables for user download and streaming activity.'
      ]
    }
  },
];

export const articles = [
  { title: 'How Nginx Won the Web: Architecture, Configuration, and Production Best Practices', date: 'Aug 16, 2026', read: '6 min', tags: ['Nginx', 'Security Hardening', 'DevOps'], url: 'https://medium.com/@chanuka.weerakkody123/how-nginx-won-the-web-architecture-configuration-and-production-best-practices-ed57fc7dc3d3' },
  { title: 'Scaling to Millions: How Elixir and the BEAM VM Handle Massive Traffic', date: 'Jul 25, 2026', read: '5 min', tags: ['Elixir', 'BEAM', 'Concurrency'], url: 'https://medium.com/@chanuka.weerakkody123/scaling-to-millions-how-elixir-and-the-beam-vm-handle-massive-traffic-without-breaking-a-sweat-fa6ccf769f01' },
  { title: 'Beyond Clean Code: The 3 Pillars of Scalable Backend Architecture', date: 'May 5, 2026', read: '4 min', tags: ['Kafka', 'Event Streaming', 'Architecture'], url: 'https://medium.com/@chanuka.weerakkody123/beyond-clean-code-the-3-pillars-of-scalable-backend-architecture-cebf7eb6cf3f' },
  { title: 'Beyond HTTPS: Mastering API Security with AES-256-CBC Encryption', date: 'Mar 11, 2026', read: '5 min', tags: ['Security', 'AES-256-CBC', 'Node.js'], url: 'https://medium.com/@chanuka.weerakkody123/%EF%B8%8F-beyond-https-mastering-api-security-with-aes-256-cbc-encryption-37d1f0b8031c' },
  { title: 'Practical AI Integration for Developers: Node.js & Laravel Edition', date: 'Nov 28, 2025', read: '7 min', tags: ['AI', 'NestJS', 'Laravel'], url: 'https://medium.com/@chanuka.weerakkody123/practical-ai-integration-for-developers-node-js-laravel-edition-c54b4c6f295e' },
  { title: "A Beginner's Guide to Microservice Architecture", date: 'Oct 9, 2025', read: '5 min', tags: ['Microservices', 'Docker'], url: 'https://medium.com/@chanuka.weerakkody123/%EF%B8%8F-a-beginners-guide-to-microservice-architecture-e7268f52abe4' },
  { title: 'Prisma: The Superhero Translator Between Your Code and Database', date: 'Oct 1, 2025', read: '4 min', tags: ['Prisma', 'TypeScript'], url: 'https://medium.com/@chanuka.weerakkody123/prisma-the-superhero-translator-between-your-code-and-database-%EF%B8%8F-cc6f709c8b2f' },
];

export const references = [
  { name: 'Mr. Prasad Waduge', role: 'CEO / Senior Trainer, IJSE' },
  { name: 'Mr. Shaan Mendis', role: 'Senior Software Engineer, Ican Lanka' },
];

export const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Journey' },
  { id: 'skills', label: 'Skills' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'projects', label: 'Projects' },
  { id: 'github', label: 'GitHub' },
  { id: 'writing', label: 'Blogs' },
  { id: 'contact', label: 'Contact' },
];
