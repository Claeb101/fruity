import Image from 'next/image'
import Link from 'next/link'
import SiteLink from './SiteLink';


export const Footer = () => {
    return (
        <footer className="absolute w-full bottom-0 mb-4 bg-navy-darkest bg-opacity-100">
            <p className='mt-4 text-white text-center text-base'>Made with 🍇 by <SiteLink href={"https://arulandu.com"} txt="Alvan Caleb Arulandu"/> {' '}
            <a className='inline-block align-middle' href="https://github.com/Claeb101/fruity">
                <img className='h-full' src="https://img.shields.io/github/last-commit/claeb101/fruity"/>
            </a>
            {' '}...to settle a debate with Lynn Tao.</p>
        </footer>
    );
}