import React, { useEffect, useRef, useState } from "react";
import css from "./Header.module.scss";
import { BiPhoneCall, BiMenuAltRight } from "react-icons/bi";
import { motion } from "framer-motion";
import { getMenuStyles, headerVariants } from "../../utils/motion";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";
import useHeaderShadow from "../../hooks/useHeaderShadow";
import { MdClose } from "react-icons/md";
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';

const Header = () => {
  const menuRef = useRef(null);
  const [menuOpened, setMenuOpened] = useState(false);
  const headerShadow = useHeaderShadow({setMenuOpened});

  //to handle click outside of sidebar on mobile
  useOutsideAlerter({
    menuRef,
    setMenuOpened,
  });

  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      whileInView="show"
      className={` ${css.wrapper}`}
      viewport={{ once: true, amount: 0.25 }}
      style={{boxShadow: headerShadow}}
    >
      <div className={`innerWidth ${css.container} flexCenter`}>
        <div className={css.name}><a href="/">Brayce Fepa</a></div>
        <ul
          className={`flexCenter ${css.menu}`}
          ref={menuRef}
          style={getMenuStyles(menuOpened)}
        >
          <li><a href="#experties">Services</a></li>
          <li><a href="#work">Experience</a></li>
        <li>
          <RouterLink to="/portfolio">
            Portfolio
          </RouterLink>
        </li>
          {/* <li><a href="#people">Testimonials</a></li> */}
        
          <li className={`flexCenter ${css.phone}`}>
            <BiPhoneCall size={"40px"} />
            <p>+237 676994001</p>
          </li>
        </ul>

        {/* for medium and small screens */}
        {!menuOpened ? <div
          className={css.menuIcon}
          onClick={() => setMenuOpened((prev) => !prev)}
        >
          <BiMenuAltRight size={30} />
        </div> : <div
          className={css.menuIcon}
          onClick={() => setMenuOpened((prev) => !prev)}
        >
          <MdClose size={30}/>
        </div>}
        
        
        
      </div>
    </motion.div>
  );
};

export default Header;
