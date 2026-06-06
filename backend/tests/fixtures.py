"""
Sample raw emails used across test modules.
"""

CLEAN_EMAIL = """\
Received: from mail.gmail.com (mail.gmail.com [209.85.220.41])
        by mx.example.com with ESMTPS id abc123
        for <alice@example.com>; Mon, 01 Jan 2024 10:00:00 +0000
Authentication-Results: mx.example.com;
        spf=pass smtp.mailfrom=bob@gmail.com;
        dkim=pass header.d=gmail.com;
        dmarc=pass header.from=gmail.com
From: Bob Smith <bob@gmail.com>
To: Alice <alice@example.com>
Subject: Meeting tomorrow
Date: Mon, 01 Jan 2024 10:00:00 +0000
Message-ID: <unique-id-001@gmail.com>
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

Hi Alice,

Just confirming our meeting tomorrow at 2pm.

Best,
Bob
"""

SUSPICIOUS_EMAIL = """\
Received: from mail.legitbank.com (192.168.1.10 [203.0.113.50])
        by mx.victim.com with SMTP id xyz789
        for <victim@victim.com>; Tue, 02 Jan 2024 09:00:00 +0000
Authentication-Results: mx.victim.com;
        spf=softfail smtp.mailfrom=support@legitbank.com;
        dkim=none;
        dmarc=none
From: Legit Bank Support <support@legitbank.com>
To: victim@victim.com
Subject: Urgent: Your account needs attention
Date: Tue, 02 Jan 2024 09:00:00 +0000
Reply-To: harvester@evil-domain.com
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

Dear Customer,

Please verify your account immediately by clicking:
http://evil-domain.com/fake-login?redirect=http://legitbank.com
http://phishing.example.net/steal-creds

Your account will be suspended in 24 hours.

Support Team
"""

PHISHING_EMAIL = """\
Received: from unknown (unknown [198.51.100.99])
        by mx.target.com with SMTP id spoofed
        for <ceo@target.com>; Wed, 03 Jan 2024 08:00:00 +0000
Authentication-Results: mx.target.com;
        spf=fail smtp.mailfrom=ceo@target.com;
        dkim=fail;
        dmarc=fail
From: CEO Name <ceo@target.com>
To: finance@target.com
Subject: URGENT Wire Transfer Required - Confidential
Date: Wed, 03 Jan 2024 08:00:00 +0000
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="boundary123"

--boundary123
Content-Type: text/plain; charset=utf-8

Finance team,

I need you to wire $50,000 immediately to:
https://wire.attacker.com/transfer?acct=9999&amount=50000

This is confidential. Do not verify with anyone.

- CEO
--boundary123
Content-Type: application/pdf; name="invoice.pdf"
Content-Disposition: attachment; filename="invoice.pdf"
Content-Transfer-Encoding: base64

dGhpcyBpcyBub3QgYSByZWFsIHBkZg==
--boundary123--
"""

MISSING_HEADERS_EMAIL = """\
From: spammer@spam.com
To: victim@example.com
Subject: You won a prize!
Content-Type: text/plain

Click here to claim: http://prize-scam.com/claim
"""
