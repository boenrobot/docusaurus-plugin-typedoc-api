import { JSONOutput } from 'typedoc';
import { DeclarationInfoMap, PackageInfo, SidebarItem } from '../types';
import { createDeclarationMap } from './data';

export function groupSidebarItems(
	decls: DeclarationInfoMap,
	groups: JSONOutput.ReflectionGroup[],
): SidebarItem[] {
	const items: SidebarItem[] = [];

	groups
		.sort((a, b) => a.title.localeCompare(b.title))
		.forEach((group, index) => {
			if (!group.children || group.children.length === 0) {
				return;
			}

			items.push({
				collapsed: index > 0,
				collapsible: true,
				items: group.children.map((id) => {
					const child = decls[id];

					return {
						href: child.permalink,
						label: child.name,
						type: 'link',
					};
				}),
				label: group.title,
				type: 'category',
			});
		});

	return items;
}

export function extractSidebar(packages: PackageInfo[]): SidebarItem[] {
	if (packages.length === 0) {
		return [];
	}

	const items: SidebarItem[] = packages.map((pkg, index) => {
		const itemsMap = createDeclarationMap(pkg.children);
		const subItems = pkg.groups ? groupSidebarItems(itemsMap, pkg.groups) : [];

		subItems.unshift({
			href: pkg.permalink,
			label: 'Overview',
			type: 'link',
		});

		return {
			collapsed: index > 0,
			collapsible: true,
			items: subItems,
			label: pkg.packageName,
			type: 'category',
		} as const;
	});

	return items.filter((item) => 'items' in item && items.length > 0);
}

export function extractSidebarPermalinks(packages: PackageInfo[]): Record<string, string> {
	const map: Record<string, string> = {};

	if (packages.length === 0) {
		return map;
	}

	packages.forEach((pkg) => {
		map[pkg.permalink] = 'api';

		pkg.children?.forEach((child) => {
			map[child.permalink] = 'api';
		});
	});

	return map;
}