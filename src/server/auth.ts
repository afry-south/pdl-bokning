import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import EmailProvider from "next-auth/providers/email";
import { createTransport } from "nodemailer";
import crypto from "node:crypto"; // Requires Node.js 18+

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
      generateVerificationToken() {
        const random = crypto.getRandomValues(new Uint8Array(8));
        return Buffer.from(random).toString("hex").slice(0, 6);
      },
      async sendVerificationRequest(params) {
        const { identifier, provider, token } = params;
        const url = new URL(params.url);
        const signInURL = new URL(
          `/auth/email?${url.searchParams.toString()}`,
          url.origin
        );
        const escapedHost = signInURL.host.replace(/\./g, "&#8203;.");

        const result = await createTransport(provider.server).sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${signInURL.host}`,
          text: `Sign in on ${signInURL.host} using the verification code: ${token}`,
          html: `<body style="background: #f9f9f9;"><table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px;"> <tr> <td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;"> Sign in to <strong>${escapedHost}</strong> using this verification code: ${token}</td></tr><tr> <td align="center" style="padding: 20px 0;"> <table border="0" cellspacing="0" cellpadding="0"> <tr> <td align="center" style="border-radius: 5px;"></td></tr></table> </td></tr><tr> <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;"> If you did not request this email you can safely ignore it. </td></tr></table></body>`,
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    verifyRequest: "/verify-code",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
