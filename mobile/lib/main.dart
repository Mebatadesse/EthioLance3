import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

void main() {
  runApp(const EthioLanceApp());
}

const Color brandGreen = Color(0xFF176B55);
const Color lightGreen = Color(0xFFEAF5EF);

class EthioLanceApp extends StatelessWidget {
  const EthioLanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'EthioLance',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: brandGreen),
        scaffoldBackgroundColor: Colors.white,
        fontFamily: 'Roboto',
      ),
      home: const WelcomeScreen(),
    );
  }
}

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // HEADER: Logo, Search, Login, Sign Up, Language
                Row(
                  children: [
                    const Icon(Icons.work_rounded, color: brandGreen, size: 24),
                    const SizedBox(width: 6),

                    const Flexible(
                      child: Text(
                        'EthioLance',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: brandGreen,
                        ),
                      ),
                    ),

                    IconButton(
                      constraints: const BoxConstraints(
                        minWidth: 34,
                        minHeight: 40,
                      ),
                      padding: EdgeInsets.zero,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Search coming soon!')),
                        );
                      },
                      icon: const Icon(Icons.search),
                      color: brandGreen,
                      tooltip: 'Search',
                    ),

                    TextButton(
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        minimumSize: const Size(0, 40),
                      ),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Login screen coming soon!'),
                          ),
                        );
                      },
                      child: const Text(
                        'Login',
                        style: TextStyle(fontSize: 12, color: brandGreen),
                      ),
                    ),

                    TextButton(
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 5),
                        minimumSize: const Size(0, 40),
                        backgroundColor: brandGreen,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Sign Up screen coming soon!'),
                          ),
                        );
                      },
                      child: const Text(
                        'Sign Up',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),

                    PopupMenuButton<String>(
                      tooltip: 'Choose language',
                      padding: EdgeInsets.zero,
                      iconSize: 22,
                      icon: const Icon(Icons.language, color: brandGreen),
                      onSelected: (language) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              language == 'en'
                                  ? 'English selected'
                                  : 'አማርኛ ተመርጧል',
                            ),
                          ),
                        );
                      },
                      itemBuilder:
                          (context) => const [
                            PopupMenuItem(value: 'en', child: Text('English')),
                            PopupMenuItem(value: 'am', child: Text('አማርኛ')),
                          ],
                    ),
                  ],
                ),

                const SizedBox(height: 35),

                // WELCOME IMAGE
                Container(
                  // Keep your existing height, width, padding,
                  // and decoration properties here.
                  child: const EthioLanceVideo(),
                ),

                // MAIN HEADING
                const Text(
                  'Your Talent, Your Future.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    height: 1.0,
                    color: Color.fromARGB(255, 125, 172, 158),
                  ),
                ),
                const SizedBox(height: 14),

                // DESCRIPTION
                const Text(
                  'Discover opportunities, connect with '
                  'clients, and grow your career with '
                  'Ethiopian talent.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.0,
                    color: Color.fromARGB(137, 187, 143, 143),
                  ),
                ),
                const SizedBox(height: 35),

                const CategoriesSection(),

                const SizedBox(height: 35),
                const SizedBox(height: 35),

                // GET STARTED BUTTON
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Registration coming soon!'),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color.fromARGB(255, 69, 135, 117),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Get Started',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                // EXISTING LOGIN LINK
                TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Login screen coming soon!'),
                      ),
                    );
                  },
                  child: const Text(
                    'Already have an account? Log in',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: brandGreen,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),

                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class JobCategory {
  final String name;
  final IconData icon;
  final List<String> subcategories;

  const JobCategory({
    required this.name,
    required this.icon,
    required this.subcategories,
  });
}

const List<JobCategory> jobCategories = [
  JobCategory(
    name: 'Programming & Technology',
    icon: Icons.code,
    subcategories: [
      'Web Development',
      'Mobile App Development',
      'Backend Development',
      'WordPress',
      'Software Testing',
      'Cybersecurity',
    ],
  ),
  JobCategory(
    name: 'Graphics & Design',
    icon: Icons.palette_outlined,
    subcategories: [
      'Logo Design',
      'Brand Identity',
      'Poster & Flyer Design',
      'UI/UX Design',
      'Illustration',
    ],
  ),
  JobCategory(
    name: 'Writing & Translation',
    icon: Icons.edit_note,
    subcategories: [
      'Content Writing',
      'Copywriting',
      'Amharic Translation',
      'English Translation',
      'Proofreading',
    ],
  ),
  JobCategory(
    name: 'Digital Marketing',
    icon: Icons.campaign_outlined,
    subcategories: [
      'Social Media Marketing',
      'SEO',
      'Online Advertising',
      'Content Marketing',
    ],
  ),
  JobCategory(
    name: 'Video & Animation',
    icon: Icons.video_library_outlined,
    subcategories: [
      'Video Editing',
      'Motion Graphics',
      '2D Animation',
      'YouTube Video Editing',
    ],
  ),
  JobCategory(
    name: 'Data & Analytics',
    icon: Icons.analytics_outlined,
    subcategories: [
      'Data Entry',
      'Excel',
      'Data Analysis',
      'Data Visualization',
      'Database Management',
    ],
  ),
];

class CategoriesSection extends StatefulWidget {
  const CategoriesSection({super.key});

  @override
  State<CategoriesSection> createState() => _CategoriesSectionState();
}

class _CategoriesSectionState extends State<CategoriesSection> {
  int selectedCategoryIndex = 0;

  @override
  Widget build(BuildContext context) {
    final selectedCategory = jobCategories[selectedCategoryIndex];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Explore Categories',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF18352D),
          ),
        ),

        const SizedBox(height: 8),

        const Text(
          'Find projects that match your skills.',
          style: TextStyle(fontSize: 14, color: Colors.black54),
        ),

        const SizedBox(height: 18),

        // Main categories
        SizedBox(
          height: 125,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: jobCategories.length,
            itemBuilder: (context, index) {
              final category = jobCategories[index];
              final isSelected = selectedCategoryIndex == index;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    selectedCategoryIndex = index;
                  });
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 145,
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? brandGreen : lightGreen,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? brandGreen : const Color(0xFFE0EAE4),
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        category.icon,
                        size: 30,
                        color: isSelected ? Colors.white : brandGreen,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        category.name,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color:
                              isSelected
                                  ? Colors.white
                                  : const Color(0xFF18352D),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 24),

        // Selected category heading
        Text(
          selectedCategory.name,
          style: const TextStyle(
            fontSize: 19,
            fontWeight: FontWeight.bold,
            color: Color(0xFF18352D),
          ),
        ),

        const SizedBox(height: 12),

        // Subcategories
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children:
              selectedCategory.subcategories.map((subcategory) {
                return ActionChip(
                  avatar: const Icon(
                    Icons.work_outline,
                    size: 17,
                    color: brandGreen,
                  ),
                  label: Text(subcategory),
                  backgroundColor: lightGreen,
                  side: BorderSide.none,
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Selected: $subcategory')),
                    );
                  },
                );
              }).toList(),
        ),
      ],
    );
  }
}

class EthioLanceVideo extends StatefulWidget {
  const EthioLanceVideo({super.key});

  @override
  State<EthioLanceVideo> createState() => _EthioLanceVideoState();
}

class _EthioLanceVideoState extends State<EthioLanceVideo> {
  late final VideoPlayerController _controller;

  @override
  void initState() {
    super.initState();

    _controller =
        VideoPlayerController.asset('assets/videos/ethiolance_intro.mp4')
          ..setLooping(true)
          ..setVolume(0)
          ..initialize().then((_) {
            if (mounted) {
              setState(() {});
              _controller.play();
            }
          });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_controller.value.isInitialized) {
      return const SizedBox(
        height: 220,
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: AspectRatio(
        aspectRatio: _controller.value.aspectRatio,
        child: VideoPlayer(_controller),
      ),
    );
  }
}
