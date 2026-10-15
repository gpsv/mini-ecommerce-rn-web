# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# react-native-screens: RNScreensFragmentFactory (MainActivity) recognizes screen
# fragments by their package name when Android recreates the Activity (e.g. a
# font size change). R8 renames them, the check fails and the app crashes with
# "Screen fragments should never be restored". Keep only their names.
-keepnames class com.swmansion.rnscreens.** extends androidx.fragment.app.Fragment
