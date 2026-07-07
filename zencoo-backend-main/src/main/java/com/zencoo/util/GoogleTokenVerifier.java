// package com.zencoo.util;

// import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
// import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
// import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
// import com.google.api.client.json.jackson2.JacksonFactory;

// public class GoogleTokenVerifier {
//     private static final String CLIENT_ID = "586834025671-lan63biqf6nd06ul6nanng2okuh7nhnh.apps.googleusercontent.com"; // Web

//     public static GoogleIdToken.Payload verify(String idTokenString) {
//         try {
//             GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
//                     GoogleNetHttpTransport.newTrustedTransport(),
//                     JacksonFactory.getDefaultInstance())
//                     .setAudience(java.util.Collections.singletonList(CLIENT_ID))
//                     .build();

//             GoogleIdToken idToken = verifier.verify(idTokenString);
//             if (idToken != null) {
//                 return idToken.getPayload();
//             }
//         } catch (Exception e) {
//             e.printStackTrace();
//         }
//         return null;
//     }
// }