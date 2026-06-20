"use client";

import React from "react";
import { StytchLogin } from "@stytch/nextjs";
import { Products } from "@stytch/vanilla-js";

export default function StytchLoginPage() {
  const styles = {
    container: {
      width: "100%",
      maxWidth: "400px",
      margin: "0 auto",
      padding: "2rem",
    },
  };

  const config = {
    products: [Products.emailMagicLinks, Products.oauth],
    emailMagicLinksOptions: {
      loginRedirectURL: `${window.location.origin}/api/auth/stytch-callback`,
      loginExpirationMinutes: 60,
      signupRedirectURL: `${window.location.origin}/api/auth/stytch-callback`,
      signupExpirationMinutes: 60,
    },
    oauthOptions: {
      loginRedirectURL: `${window.location.origin}/api/auth/stytch-callback`,
      signupRedirectURL: `${window.location.origin}/api/auth/stytch-callback`,
    },
  };

  return (
    <div style={styles.container}>
      <h1 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول (Stytch)</h1>
      <StytchLogin config={config} styles={{}} />
    </div>
  );
}
