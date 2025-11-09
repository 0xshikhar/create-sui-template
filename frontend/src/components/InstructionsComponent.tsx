"use client";
import styles from "../styles/InstructionsComponent.module.css";
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';


export default function InstructionsComponent() {
	const account = useCurrentAccount();
	

	return (
		<div className="min-h-screen">
			<div className={styles.container}>
				<header className={styles.header_container}>
					<h1 className="p-10 m-10">
						Create<span> Sui Frontend</span>
					</h1>
					<h3 className="text-[24px] p-4 mb-10 ">By <a href="https://x.com/0xShikhar">0xShikhar</a> </h3>

					<ConnectButton />

					<p className="p-10">
						Get started by editing this page in{" "}
						<span>/pages/index.tsx</span>
					</p>

					{/* <h1>{JSON.stringify(data, null, 2)}</h1>; */}

					


				</header>
				<div>
					{account ? (
						<div className="text-sm text-gray-300">Connected: {account.address}</div>
					) : (
						"No current account"
					)}
				</div>
			</div>
		</div>
	);
}
