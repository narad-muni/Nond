<script>
    import {
        Navbar,
        NavBrand,
        NavLi,
        NavUl,
        NavHamburger,
        Button,
        Input,
        Avatar,
        Dropdown,
        DropdownHeader,
        DropdownItem,
        DropdownDivider,
        Chevron,
    } from 'flowbite-svelte'
</script>

<Navbar let:hidden let:toggle class="bg-slate-100">
    <NavBrand href="/">
        <img
        src="logo.png"
        class="mr-3 h-6 sm:h-9"
        alt="Nond Logo"
        />
        <span class="self-center whitespace-nowrap text-xl font-semibold">
        Nond
        </span>
    </NavBrand>
    
    <NavUl {hidden} class="order-1">
        <NavLi id="master" class="cursor-pointer"><Chevron aligned>Master</Chevron></NavLi>
        <NavLi class="cursor-pointer">Tasks</NavLi>
        <NavLi id="archived" class="cursor-pointer"><Chevron aligned>Archived</Chevron></NavLi>
        <NavLi id="deleted" class="cursor-pointer"><Chevron aligned>Deleted</Chevron></NavLi>
        <NavLi id="register" class="cursor-pointer"><Chevron aligned>Registers</Chevron></NavLi>
        <NavLi id="template" class="cursor-pointer"><Chevron aligned>Templates</Chevron></NavLi>
        <NavLi id="billing" class="cursor-pointer"><Chevron aligned>Billing</Chevron></NavLi>
    </NavUl>

    <div class="flex md:order-2">
        <Avatar class="!bg-white" id="avatar" >A</Avatar>
        <NavHamburger on:click={toggle} />
    </div>

    <Dropdown placement="bottom" triggeredBy="#master">
        <DropdownItem>Client</DropdownItem>
        <DropdownItem>Company</DropdownItem>
        <DropdownItem>Service</DropdownItem>
        <DropdownItem>Role</DropdownItem>
        <DropdownItem>Leads</DropdownItem>
        <DropdownItem>Employee</DropdownItem>
    </Dropdown>

    <Dropdown placement="bottom" triggeredBy="#archived">
        <DropdownItem>GST 1</DropdownItem>
        <DropdownItem>GST 3B</DropdownItem>
        <DropdownItem>IT</DropdownItem>
    </Dropdown>

    <Dropdown placement="bottom" triggeredBy="#deleted">
        <DropdownItem>Client</DropdownItem>
        <DropdownItem>Company</DropdownItem>
        <DropdownItem>Employee</DropdownItem>
        <DropdownItem>Register</DropdownItem>
        <DropdownItem>Invoice</DropdownItem>
    </Dropdown>

    <Dropdown placement="bottom" triggeredBy="#register">
        <DropdownItem>GST 1</DropdownItem>
        <DropdownItem>GST 3B</DropdownItem>
        <DropdownItem>IT</DropdownItem>
    </Dropdown>

    <Dropdown placement="bottom" triggeredBy="#template">
        <DropdownItem>Register Template</DropdownItem>
        <DropdownItem>Master Template</DropdownItem>
        <DropdownItem>Invoice Template</DropdownItem>
    </Dropdown>

    <Dropdown placement="bottom" triggeredBy="#billing">
        <DropdownItem>Invoice</DropdownItem>
        <DropdownItem>Pending Invoice</DropdownItem>
        <DropdownItem>Generate Invoice</DropdownItem>
    </Dropdown>

    <Dropdown placement="bottom" triggeredBy="#avatar">
        <DropdownHeader>
        <span class="block text-sm"> Admin </span>
        <span class="block truncate text-sm font-light"> admin </span>
        </DropdownHeader>
        <DropdownItem>Sign out</DropdownItem>
    </Dropdown>
    
</Navbar>