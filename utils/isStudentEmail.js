// utils/isStudentEmail.js

const forbiddenDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "protonmail.com"
];

const allowedExtraDomains = [
  "vitstudent.ac.in",
  "students.bits-pilani.ac.in",
  "jmi.ac.in",
  "lnmiit.ac.in",
  "amity.edu",
  "nirmauni.ac.in",
  "iiitd.ac.in",
  "iiti.ac.in",
  "srmist.edu.in",
  "daiict.ac.in",
  "vit.ac.in",
  "manipal.edu",
  "chitkara.edu.in",
  "thapar.edu",
  "iitb.ac.in",
  "iitm.ac.in",
  "iitk.ac.in",
  "iitkgp.ac.in",
  "iitd.ac.in",
  "iitgn.ac.in",
  "nitsri.ac.in",
  "nitrkl.ac.in",
  "nits.ac.in",
  "annauniv.edu",
  "puneuniversity.ac.in",
  "cusat.ac.in",
  "bhu.ac.in",
  "jnu.ac.in",
  "du.ac.in",
  "sharda.ac.in",
  "manuu.edu.in",
  "gcu.edu.in",
  "hri.res.in",
  "mdu.ac.in",
  "pu.ac.in"
];

function isStudentEmail(email) {
  const domain = email.trim().split("@")[1]?.toLowerCase();

  if (!domain || forbiddenDomains.includes(domain)) return false;

  return (
    domain.endsWith(".edu") ||
    domain.endsWith(".ac.in") ||
    domain.endsWith(".edu.in") ||
    domain.endsWith(".ac.uk") ||
    domain.includes(".students.") ||
    domain.includes(".stu.") ||
    domain.includes(".ac.") ||
    domain.includes(".edu.") ||
    allowedExtraDomains.includes(domain)
  );
}

module.exports = isStudentEmail;
