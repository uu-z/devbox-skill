import type { Provisioner, VMSpec, VM } from '../interfaces/index.ts';
import { execProcess, execProcessSilent } from '../utils/process';

export class IncusProvisioner implements Provisioner {
  async create(spec: VMSpec): Promise<VM> {
    const image = spec.image || 'images:alpine/3.19';
    await execProcessSilent(['incus', 'launch', image, spec.id]);
    await this.waitForRunning(spec.id);
    return await this.get(spec.id);
  }

  async destroy(id: string): Promise<void> {
    await execProcessSilent(['incus', 'stop', id, '--force']);
    await execProcessSilent(['incus', 'delete', id]);
  }

  async get(id: string): Promise<VM> {
    const stdout = await execProcess(['incus', 'list', id, '--format', 'json']);
    const instances = JSON.parse(stdout);

    if (instances.length === 0) {
      throw new Error(`Instance not found: ${id}`);
    }

    const instance = instances[0];

    // Get IPv4 address
    let address = id; // fallback to name
    if (instance.state?.network?.eth0?.addresses) {
      const ipv4 = instance.state.network.eth0.addresses.find(
        (addr: any) => addr.family === 'inet'
      );
      if (ipv4) {
        address = ipv4.address;
      }
    }

    return {
      id: instance.name,
      address,
      state: instance.status,
    };
  }

  private async waitForRunning(id: string, maxWait = 30000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      try {
        const vm = await this.get(id);
        if (vm.state === 'Running') {
          return;
        }
      } catch {
        // Instance not ready yet
      }

      await Bun.sleep(1000);
    }

    throw new Error(`Instance ${id} did not start within ${maxWait}ms`);
  }
}
