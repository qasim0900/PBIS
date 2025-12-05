// React import not required with automatic JSX runtime
import { Typography, Box, IconButton } from "@mui/material";
import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const contactInfo = [
  { icon: <Phone size={20} />, text: "+92 300 1234567" },
  { icon: <Mail size={20} />, text: "info@example.com" },
];

const socialLinks = [
  { icon: <Facebook />, href: "#" },
  { icon: <Twitter />, href: "#" },
  { icon: <Instagram />, href: "#" },
  { icon: <Linkedin />, href: "#" },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      className="w-full bg-gray-900 text-white py-8 mt-10"
    >
      <Box className="container mx-auto px-4 flex flex-col items-center gap-4">
        {/* Contact Info */}
        {contactInfo.map(({ icon, text }, idx) => (
          <Box key={idx} className="flex items-center gap-2">
            {icon}
            <Typography variant="body1">{text}</Typography>
          </Box>
        ))}

        {/* Social Media */}
        <Box className="flex items-center gap-4 mt-4">
          {socialLinks.map(({ icon, href }, idx) => (
            <IconButton
              key={idx}
              href={href}
              target="_blank"
              className="text-white"
              aria-label={`Link to ${icon.type.name}`}
            >
              {icon}
            </IconButton>
          ))}
        </Box>

        {/* Footer Text */}
        <Typography variant="body2" className="mt-4 opacity-70">
          © {new Date().getFullYear()} Purple Banana Inventory System
        </Typography>
      </Box>
    </Box>
  );
}
