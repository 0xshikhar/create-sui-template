import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/src/styles/Home.module.css'
import InstructionsComponent from "../components/InstructionsComponent";


const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <div className='flex'>
        <main className={styles.main}>
          {/* just remove Instrctions Component & write your code */}
          <InstructionsComponent></InstructionsComponent>
        </main>
      </div>
    </>
  )
}
