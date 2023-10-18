import styles from "../styles/InstructionsComponent.module.css";
import { useRouter } from "next/router";
// import { useSuiClientQuery, ConnectButton } from '@mysten/dapp-kit';

import { useWalletKit } from '@mysten/wallet-kit';
import { ConnectButton } from '@mysten/wallet-kit';


export default function InstructionsComponent() {
	// const { data, isLoading, error, refetch } = useSuiClientQuery('getOwnedObjects', {
	// 	owner: '0x123',
	// });

	// if (isLoading) {
	// 	return <div>Loading...</div>;
	// }
	const router = useRouter();

	const { currentAccount, currentWallet } = useWalletKit();
	console.log("current account", currentAccount)
	console.log("current wallet", currentWallet)
	


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
					{currentAccount ? (
						<div>
							{currentWallet ? ("Hi 👋, this is "+currentWallet.name) : ("No wallet connected")}
						</div>
					)
						:
						(
							"No current account"
						)
					}
				</div>
			</div>
		</div>
	);
}
