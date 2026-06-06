export const SAMPLES = {
  clean: {
    label: "Clean",
    email: `Received: from mail.github.com (mail.github.com [192.30.252.192])
        by mx.company.com with ESMTPS id abc123xyz
        for <developer@company.com>; Mon, 03 Jun 2024 14:22:00 +0000
Authentication-Results: mx.company.com;
        spf=pass smtp.mailfrom=notifications@github.com;
        dkim=pass header.d=github.com;
        dmarc=pass header.from=github.com
From: GitHub <notifications@github.com>
To: developer@company.com
Subject: [github/myrepo] Pull request merged: Fix authentication bug (#142)
Date: Mon, 03 Jun 2024 14:22:00 +0000
Message-ID: <pr-merged-12345@github.com>
Return-Path: <bounce@github.com>
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

Hi developer,

Pull request #142 "Fix authentication bug" has been merged into main by alice.

Branch: main
Author: alice
Reviewer: bob

View the merged pull request:
https://github.com/mycompany/myrepo/pull/142

---
You are receiving this notification because you are subscribed to this repository.
Unsubscribe: https://github.com/notifications/unsubscribe-auth/ABC123

GitHub, Inc.
88 Colin P Kelly Jr St, San Francisco, CA 94107
`,
  },

  suspicious: {
    label: "Suspicious",
    email: `Received: from mail.secure-alerts.net (unknown [198.51.100.44])
        by mx.customer.com with SMTP id zxcvbn987
        for <customer@customer.com>; Tue, 04 Jun 2024 08:15:00 +0000
Authentication-Results: mx.customer.com;
        spf=softfail smtp.mailfrom=security@nationalbank.com;
        dkim=none;
        dmarc=none
From: National Bank Security <security@nationalbank.com>
To: customer@customer.com
Subject: Urgent: Suspicious Activity Detected on Your Account
Date: Tue, 04 Jun 2024 08:15:00 +0000
Reply-To: alerts@secure-banking-update.net
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

Dear Valued Customer,

We have detected unusual login activity on your National Bank account.

Your account has been temporarily limited. To restore full access,
please verify your identity within 24 hours:

http://secure-banking-update.net/verify?token=eyJhbGciOiJIUzI1NiJ9

If you do not verify, your account will be permanently suspended.

For immediate assistance call: +1-800-555-0199

National Bank Security Team
`,
  },

  phishing: {
    label: "Phishing",
    email: `Received: from unknown (unknown [203.0.113.77])
        by mx.targetcorp.com with SMTP id fakehop001
        for <cfo@targetcorp.com>; Wed, 05 Jun 2024 07:45:00 +0000
Authentication-Results: mx.targetcorp.com;
        spf=fail smtp.mailfrom=ceo@targetcorp.com;
        dkim=fail;
        dmarc=fail
From: Robert Chen - CEO <ceo@targetcorp.com>
To: cfo@targetcorp.com
Subject: CONFIDENTIAL - Urgent Wire Transfer Required Today
Date: Wed, 05 Jun 2024 07:45:00 +0000
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="bound_ph1sh1ng_abc"

--bound_ph1sh1ng_abc
Content-Type: text/plain; charset=utf-8

Sarah,

I need you to process an urgent wire transfer for a confidential acquisition
we are finalizing today. This is time-sensitive and must be completed before
market close.

Amount: $187,500 USD
Please log in and initiate transfer:
https://wire-portal.targetcorp-finance.com/transfer?ref=ACQ-2024-CONF

Download the acquisition brief for account details:
https://dropbox-share.net/dl/Invoice_URGENT_June2024.pdf

This is strictly confidential — do not discuss with anyone in the office
or contact IT. I am in meetings all day but you can reach me at
ceo.chen.personal@gmail-secure.net

Process immediately. Board approval is already in place.

Robert Chen
CEO, TargetCorp

--bound_ph1sh1ng_abc
Content-Type: application/pdf; name="Invoice_URGENT.pdf"
Content-Disposition: attachment; filename="Invoice_URGENT.pdf"
Content-Transfer-Encoding: base64

JVBERi0xLjQKdGhpcyBpcyBhIGZha2UgcGRmIGZvciBkZW1v
--bound_ph1sh1ng_abc--
`,
  },
};
