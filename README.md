import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'dart:ui';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_vector_icons/flutter_vector_icons.dart';
import 'package:get/get.dart';
import 'package:jobility/controllers/login_provider.dart';
import 'package:jobility/controllers/zoom_provider.dart';
import 'package:jobility/models/response/auth/profile_model.dart';
import 'package:jobility/services/helpers/auth_helper.dart';
import 'package:jobility/views/common/BackBtn.dart';
import 'package:jobility/views/common/app_bar.dart';
import 'package:jobility/views/common/custom_outline_btn.dart';
import 'package:jobility/views/common/drawer/drawer_widget.dart';
import 'package:jobility/views/common/exports.dart';
import 'package:jobility/views/common/height_spacer.dart';
import 'package:jobility/views/common/pages_loader.dart';
import 'package:jobility/views/common/styled_container.dart';
import 'package:jobility/views/common/width_spacer.dart';
import 'package:jobility/views/screens/auth/non_user.dart';
import 'package:jobility/views/screens/auth/widgets/edit_button.dart';
import 'package:jobility/views/screens/auth/widgets/skills.dart';
import 'package:jobility/views/screens/jobs/add_jobs.dart';
import 'package:jobility/views/screens/mainscreen.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:pdf_render/pdf_render.dart' as pdf_render;

import 'edit_profile_page.dart';
import 'login.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key, required this.drawer});
  final bool drawer;
  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  ProfileRes? profile;
  bool isLoading = true;
  String defaultImage = "https://d326fntlu7tb1e.cloudfront.net/uploads/b5065bb8-4c6b-4eac-a0ce-86ab0f597b1e-vinci_04.jpg";
  ImageProvider? pdfThumbnail;
  bool isHoveringPdf = false;

  @override
  void initState() {
    super.initState();
    initializeProfile();
  }

  Future<void> initializeProfile() async {
    var loginNotifier = Provider.of<LoginNotifier>(context, listen: false);
    if (!loginNotifier.loggedIn) {
      setState(() {
        isLoading = false;
      });
      return;
    }

    try {
      final profileData = await AuthHelper.getProfile();
      setState(() {
        profile = profileData;
        isLoading = false;
      });

      if (profile?.resume != null) {
        await _generatePdfThumbnail();
      }

      if (profileData.isAgent) {
        final SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('agentId', profileData.id);
      }
    } catch (e) {
      print('Error loading profile: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _generatePdfThumbnail() async {
    try {
      String? base64Resume = await AuthHelper.getResume(profile!.id);
      if (base64Resume != null) {
        final bytes = base64Decode(base64.normalize(base64Resume));
        final dir = await getApplicationDocumentsDirectory();
        final file = File('${dir.path}/resume.pdf');
        await file.writeAsBytes(bytes);

        // Generate thumbnail using pdf_render
        final doc = await pdf_render.PdfDocument.openFile(file.path);
        final page = await doc.getPage(1);
        final pageImage = await page.render(
          width: 200,
          height: 280,

        );
        final imgBytes = await pageImage.createImageDetached();
        // setState(() {
        //   pdfThumbnail = MemoryImage(imgBytes.asUint8List());
        // });
      }
    } catch (e) {
      print('Error generating PDF thumbnail: $e');
    }
  }

  Future<File> _fetchAndDecodeResume(String base64String) async {
    final bytes = base64Decode(base64.normalize(base64String));
    final dir = await getApplicationDocumentsDirectory();
    final file = File('${dir.path}/resume.pdf');
    await file.writeAsBytes(bytes);
    return file;
  }

  void _openPDFViewer(File file) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PDFViewerPage(file: file),
      ),
    );
  }

  Future<void> _handleResumeUpload() async {
    setState(() { isLoading = true; });

    bool uploadResult = await AuthHelper.uploadResume();
    if (uploadResult) {
      Get.snackbar(
          "Success",
          "Resume uploaded successfully",
          backgroundColor: Colors.green,
          colorText: Colors.white
      );
      await initializeProfile();
    } else {
      Get.snackbar(
          "Error",
          "Failed to upload resume",
          backgroundColor: Colors.red,
          colorText: Colors.white
      );
    }

    setState(() { isLoading = false; });
  }

  Widget buildProfileHeader() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 20),
      decoration: BoxDecoration(
          borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20)
          ),
          color: Color(kLightBlue.value)
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularAvata(
                  image: profile?.profile ?? defaultImage,
                  w: 50,
                  h: 50
              ),
              const WidthSpacer(width: 20),
              SizedBox(
                height: 50,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: EdgeInsets.all(3.w),
                      decoration: const BoxDecoration(
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                          color: Colors.white30
                      ),
                      child: ReusableText(
                          text: profile?.email ?? "Loading...",
                          style: appStyle(14, Color(kLight.value), FontWeight.w400)
                      ),
                    ),
                    SizedBox(height: 5.h),
                    ReusableText(
                      text: profile?.name ?? "Loading...",
                      style: appStyle(12, Color(kLight.value), FontWeight.w300),
                    ),
                  ],
                ),
              ),
            ],
          ),
          GestureDetector(
              onTap: () => _handleEditProfile(),
              child: Padding(
                padding: EdgeInsets.only(top: 10.0.w),
                child: Icon(
                  Feather.edit,
                  color: Color(kLight.value),
                ),
              )
          )
        ],
      ),
    );
  }

  Widget buildResumeSection() {
    return Stack(
      children: [
        Container(
          width: width,
          height: hieght * 0.12,
          decoration: BoxDecoration(
              color: Color(kLightGrey.value),
              borderRadius: const BorderRadius.all(Radius.circular(12))
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Container(
                margin: EdgeInsets.only(left: 12.w),
                width: 60.w,
                height: 70.h,
                decoration: BoxDecoration(
                    color: Color(kLight.value),
                    borderRadius: const BorderRadius.all(Radius.circular(12))
                ),
                child: MouseRegion(
                  onEnter: (_) => setState(() => isHoveringPdf = true),
                  onExit: (_) => setState(() => isHoveringPdf = false),
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: pdfThumbnail != null
                            ? ImageFiltered(
                          imageFilter: ImageFilter.blur(
                              sigmaX: isHoveringPdf ? 0 : 3,
                              sigmaY: isHoveringPdf ? 0 : 3
                          ),
                          child: Image(
                            image: pdfThumbnail!,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: double.infinity,
                          ),
                        )
                            : Container(
                          color: Colors.grey[200],
                          child: Center(
                            child: Text(
                              'PDF',
                              style: appStyle(16, Colors.black54, FontWeight.w500),
                            ),
                          ),
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(isHoveringPdf ? 0.1 : 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const WidthSpacer(width: 20),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ReusableText(
                      text: "Your Resume",
                      style: appStyle(16, Color(kDark.value), FontWeight.w500)
                  ),
                  Text(
                      profile?.resume != null
                          ? "Click to preview your resume"
                          : "Upload your resume (PDF format)",
                      style: appStyle(8, Color(kDarkGrey.value), FontWeight.w500)
                  ),
                ],
              ),
            ],
          ),
        ),
        if (profile?.resume != null)
          Positioned.fill(
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () async {
                  try {
                    String? base64Resume = await AuthHelper.getResume(profile!.id);
                    if (base64Resume != null) {
                      File resumeFile = await _fetchAndDecodeResume(base64Resume);
                      _openPDFViewer(resumeFile);
                    } else {
                      Get.snackbar(
                          "Error",
                          "Failed to fetch resume",
                          backgroundColor: Colors.red,
                          colorText: Colors.white
                      );
                    }
                  } catch (e) {
                    print('Error fetching resume: $e');
                    Get.snackbar(
                        "Error",
                        "Failed to fetch resume",
                        backgroundColor: Colors.red,
                        colorText: Colors.white
                    );
                  }
                },
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        Positioned(
          right: 0.w,
          child: EditButton(
              onTap: () async {
                await _handleResumeUpload();
                await initializeProfile();
              }
          ),
        ),
      ],
    );
  }

  Widget buildProfileContent() {
    return ListView(
      padding: EdgeInsets.symmetric(horizontal: 20.w),
      children: [
        const HeightSpacer(size: 30),
        ReusableText(
            text: 'Profile',
            style: appStyle(15, Color(kDark.value), FontWeight.w600)
        ),
        const HeightSpacer(size: 10),
        buildResumeSection(),
        const HeightSpacer(size: 20),
        const SkillsWidget(),
        const HeightSpacer(size: 20),
        buildDisabilitySection(),
        const HeightSpacer(size: 20),
        buildAgentSection(),
        const HeightSpacer(size: 20),
        buildLogoutButton(),
        const HeightSpacer(size: 20),
      ],
    );
  }

  Widget buildDisabilitySection() {
    if (profile?.disability != null && profile!.disability!.isNotEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ReusableText(
              text: 'Disability Information',
              style: appStyle(14, Color(kDark.value), FontWeight.w600)
          ),
          const HeightSpacer(size: 10),
          Container(
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
                color: Color(kLightGrey.value),
                borderRadius: const BorderRadius.all(Radius.circular(12))
            ),
            child: ReusableText(
              text: profile!.disability!,
              style: appStyle(12, Color(kDark.value), FontWeight.w400),
            ),
          ),
          const HeightSpacer(size: 10),
          if (profile?.pwdIdImage != null && profile!.pwdIdImage!.isNotEmpty)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ReusableText(
                  text: 'PWD ID Card',
                  style: appStyle(15, Color(kDark.value), FontWeight.w600),
                ),
                const HeightSpacer(size: 10),
                Container(
                  width: 350.w,
                  height: 200.h,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12.w),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12.w),
                    child: Image.file(
                      File(profile!.pwdIdImage!),
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ],
            ),
        ],
      );
    } else {
      return Container();
    }
  }
  Widget buildAgentSection() {
    if (profile?.isAgent ?? false) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ReusableText(
              text: 'Agent Section',
              style: appStyle(14, Color(kDark.value), FontWeight.w600)
          ),
          const HeightSpacer(size: 20),
          CustomOutlineBtn(
              width: width,
              onTap: () {
                Get.to(() => const AddJobs());
              },
              hieght: 40.h,
              text: "Add Jobs",
              color: Color(kNewBlue.value)
          ),
          const HeightSpacer(size: 10),
          CustomOutlineBtn(
              width: width,
              onTap: () {},
              hieght: 40.h,
              text: "Update Information",
              color: Color(kNewBlue.value)
          ),
        ],
      );
    } else {
      return CustomOutlineBtn(
          width: width,
          onTap: () {},
          hieght: 40.h,
          text: "Apply to become an agent",
          color: Color(kNewBlue.value)
      );
    }
  }

  Widget buildLogoutButton() {
    var zoomNotifier = Provider.of<ZoomNotifier>(context);
    var loginNotifier = Provider.of<LoginNotifier>(context);

    return CustomOutlineBtn(
      width: width,
      onTap: () {
        Get.snackbar(
          "Logged Out",
          "You have been successfully logged out.",
          colorText: Color(kDark.value),
          backgroundColor: Color(kGreen.value),
          icon: const Icon(Icons.check_circle),
        );

        zoomNotifier.currentIndex = 0;
        loginNotifier.logout();

        Future.delayed(const Duration(seconds: 2), () {
          Get.offAll(() => const LoginPage());
        });
      },
      hieght: 40.h,
      text: "Proceed to logout",
      color: Color(kNewBlue.value),
    );
  }

  Future<void> _handleEditProfile() async {
    await Get.to(() => const EditProfilePage());
    // Refresh profile after returning from edit page
    await initializeProfile();
  }

  @override
  Widget build(BuildContext context) {
    var loginNotifier = Provider.of<LoginNotifier>(context);

    return Scaffold(
      backgroundColor: Color(kNewBlue.value),
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50.h),
        child: CustomAppBar(
          color: Color(kNewBlue.value),
          text: profile?.username?.toUpperCase() ?? '',
          child: Padding(
            padding: EdgeInsets.all(12.0.h),
            child: widget.drawer == false
                ? const BackBtn()
                : DrawerWidget(color: Color(kLight.value)),
          ),
        ),
      ),
      body: loginNotifier.loggedIn == false
          ? const NonUser()
          : isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
        children: [
          Positioned(
            right: 0,
            left: 0,
            bottom: 0,
            top: 0,
            child: buildProfileHeader(),
          ),
          Positioned(
            right: 0,
            left: 0,
            bottom: 0,
            top: 90.h,
            child: Container(
              decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20)
                  ),
                  color: Color(kLight.value)
              ),
              child: buildStyleContainer(
                context,
                buildProfileContent(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CircularAvata extends StatelessWidget {
  const CircularAvata({
    super.key,
    required this.image,
    required this.w,
    required this.h
  });

  final String image;
  final double w;
  final double h;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.all(Radius.circular(99.w)),
      child: CachedNetworkImage(
        imageUrl: image,
        width: w,
        height: h,
        fit: BoxFit.cover,
        placeholder: (context, url) => const Center(
          child: CircularProgressIndicator.adaptive(),
        ),
        errorWidget: (context, url, error) => const Icon(Icons.error),
      ),
    );
  }
}

class PDFViewerPage extends StatelessWidget {
  final File file;

  const PDFViewerPage({super.key, required this.file});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Resume Preview'),
      ),
      body: PDFView(
        filePath: file.path,
        enableSwipe: true,
        swipeHorizontal: false,
        autoSpacing: true,
        pageFling: true,
        pageSnap: true,
        defaultPage: 0,
        fitPolicy: FitPolicy.BOTH,
      ),
    );
  }
}

