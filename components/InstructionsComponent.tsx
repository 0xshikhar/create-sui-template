import styles from "../styles/InstructionsComponent.module.css";
import { useRouter } from "next/router";
import { useSuiClientQuery } from '@mysten/dapp-kit';


export default function InstructionsComponent() {
	const { data, isLoading, error, refetch } = useSuiClientQuery('getOwnedObjects', {
		owner: '0x123',
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}
	const router = useRouter();
	return (
		<div className="min-h-screen">
			<div className={styles.container}>
				<header className={styles.header_container}>
					<h1 className="p-10 m-10">
						Create<span> Polkadot Frontend</span>
					</h1>
					<h3 className="text-[24px] p-4 mb-10 ">By <span>0xShikhar</span> </h3>

					<p>
						Get started by editing this page in{" "}
						<span>/pages/index.tsx</span>
					</p>
					
					<h1>{JSON.stringify(data, null, 2)}</h1>;

				</header>
			</div>
		</div>
	);
}
