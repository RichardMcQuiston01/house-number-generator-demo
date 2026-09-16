import {ConfiguratorForm} from './components/configurator';
import {DonateCard} from './components/layout/DonateCard';
import {Footer} from './components/layout/Footer';
import {Header} from './components/layout/Header';
import {Hero} from './components/layout/Hero';
import {PreviewPanel} from './components/preview/PreviewPanel';
import {useSignGenerator} from './lib/useSignGenerator';

export default function App(): JSX.Element {
  const api = useSignGenerator();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <Hero />
        <div className="grid gap-10 pb-16 lg:grid-cols-2">
          <ConfiguratorForm api={api} />
          <div className="lg:sticky lg:top-6 lg:self-start">
            <PreviewPanel api={api} />
          </div>
        </div>
      </main>
      <Footer />
      <DonateCard />
    </div>
  );
}
