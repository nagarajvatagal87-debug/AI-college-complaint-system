import bcrypt from "bcryptjs";

const hash = await bcrypt.hash("staff123", 10);

console.log(hash);