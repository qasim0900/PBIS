// React import not required with automatic JSX runtime
import { Typography, Box, IconButton } from "@mui/material";
import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <Box
      component="footer"
      className="w-full bg-gray-900 text-white py-8 mt-10"
    >
      <Box className="container mx-auto px-4 flex flex-col items-center gap-4">
        {/* Phone */}
        <Box className="flex items-center gap-2">
          <Phone size={20} />
          <Typography variant="body1">+92 300 1234567</Typography>
        </Box>

        {/* Email */}
<Box className="flex items-center gap-2">
  <Mail size={20} />
  <Typography variant="body1">info@example.com</Typography>
</Box>

        {/* Social Media */}
        <Box className="flex items-center gap-4 mt-4">
          <IconButton href="#" target="_blank" className="text-white">
            <Facebook />
          </IconButton>

          <IconButton href="#" target="_blank" className="text-white">
            <Twitter />
          </IconButton>

          <IconButton href="#" target="_blank" className="text-white">
            <Instagram />
          </IconButton>

          <IconButton href="#" target="_blank" className="text-white">
            <Linkedin />
          </IconButton>
        </Box>

        {/* Footer Text */}
        <Typography variant="body2" className="mt-4 opacity-70">
          © {new Date().getFullYear()} Purple Banana Inventory System
        </Typography>
      </Box>
    </Box>
  );
}
