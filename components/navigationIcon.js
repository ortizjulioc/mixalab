// components/navigationIcon.js (actualizado con size={32} para consistencia)
import React from 'react'
import { FaArchive } from 'react-icons/fa';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineTrendingUp,
  HiOutlineArrowDown,
  HiOutlineStar,
} from 'react-icons/hi'
import { MdLibraryMusic, MdExtension } from "react-icons/md";  // food icon

const navigationIcon = {
  home: <HiOutlineHome size={32} />,
  product: <HiOutlineCube size={32} />,
  customer: <HiOutlineUserGroup size={32} />,
  maintenance: <HiOutlineCog size={32} />,
  genre: <MdLibraryMusic size={32} />,
  "add-ons": <MdExtension size={32} />,
  service: <FaArchive size={32} />,
  users: <HiOutlineUserGroup size={32} />,
  tiers: <HiOutlineStar size={32} />,                     // Niveles / Tiers
  'maintain-requirements': <HiOutlineShieldCheck size={32} />, // Mantener: estabilidad / cumplimiento
  'upgrade-requirements': <HiOutlineTrendingUp size={32} />,   // Subir de nivel
  'downgrade-triggers': <HiOutlineArrowDown size={32} />,
  'creator-profiles': <HiOutlineUserGroup size={32} />,

}

export default navigationIcon